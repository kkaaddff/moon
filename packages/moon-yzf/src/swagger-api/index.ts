/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/4/2
 **/

import * as request from 'request';
import * as fse from 'fs-extra';
import * as _ from 'lodash';
import {join} from 'path';
import MoonCore from 'moon-core';
import debug from 'debug';
import {IWebApiContext, IWebApiDefinded, IWebApiGroup, SchemaProps} from 'moon-core/declarations/typings/api';

import {IFileSaveOptions} from 'moon-core/declarations/typings/page';
import {IInsertOption} from 'moon-core/declarations/typings/util';
import {IMoonConfig} from 'moon-core/declarations/typings/config';
import {resSchemaModify, transfer} from "./util";

const log = debug('j2t:cli');
async function loadJson(): Promise<any> {
  return new Promise((resolve, reject) => {

    console.log(`从${defaulltMoonConfig.api.swaggerUrl}中加载api doc信息`);
    request(defaulltMoonConfig.api.swaggerUrl, function(error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}

let defaulltMoonConfig: IMoonConfig;

let projectPath = process.cwd();
let configFilePath = join(projectPath, '.moon.json');
try {
  console.log('读取配置文件', configFilePath);
  if (fse.existsSync(configFilePath)) {
    defaulltMoonConfig = fse.readJSONSync(configFilePath);
  } else {
    throw new Error('配置不存在:' + configFilePath);
  }
} catch (err) {
  throw new Error('配置读取失败:' + configFilePath);
}

interface IApiIndex {
  [controllerName: string]: {
    fileName: string;
    methods: {
      [methodName: string]: {
        responseTs: string[];
      };
    };
  };
}
let oldApiIndex: IApiIndex = {};

function isDebug():boolean{
  return process.env.hasOwnProperty("DEBUG");
}
/**
 * 判断是否是新添加的方法,如果是新方法, 默认在开发时走mock流程.
 *
 * @param {string} controller
 * @param {string} method
 * @returns {boolean}
 */
function isNewMethod(controller: string, method: string): boolean {
  let controllerInfo = oldApiIndex[controller];
  if (controllerInfo && controllerInfo.methods[method]) {
    return false;
  }

  return true;
}

function isContain(db,controller: string, method: string){

  if(db[controller] && db[controller].includes(method)){
    return true;
  }else{
    return false;
  }
}


process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error);

});

(async () => {
  let workBase = projectPath;
  const ApiIndexPath = join(workBase,defaulltMoonConfig.api.dir ,'_api-info.json');

  let apiJson = await loadJson();
  //   // //按分组;
  // let apiJson= await fse.readJSON(join(__dirname, 'data/swagger-api-new.json'));
  //
  // //单个文件 生成 , 不生成总的.生成总的, 更新 会有问题.
  let apiGroups = transfer(apiJson);

  if(isDebug()) {
    await fse.writeFileSync(join(workBase, 'swagger-api.json'), JSON.stringify(apiJson,null,2));
    await fse.writeFileSync(join(workBase, 'webapi-group.json'), JSON.stringify(apiGroups,null,2));
  }

  try {
    oldApiIndex = await fse.readJSONSync(ApiIndexPath);
  } catch (err) {
    console.warn('读取 历史api索引出错: ', err);
  }

  let apiDir = join(workBase,defaulltMoonConfig.api.dir);

  let inserts: IInsertOption[] = [];
  let newMethods: { controller: string; method: string }[] = []; //新添加的方法记录
  let includeApis =defaulltMoonConfig.api.include
  for (let i = 0, ilen = apiGroups.length; i < ilen; i++) {
    try {
      let webapiGroup: IWebApiGroup = apiGroups[i];
      if (defaulltMoonConfig.api.exclude.includes(webapiGroup.name)) {
        console.log(
          `${i+1}/${ilen}`,
          'ignore webapiGroup:',
          webapiGroup.name,
          'due to MoonConfig.api.exclude'
        );
        continue;
      } else {
        console.log(`${i+1}/${ilen}`, 'current webapiGroup:', webapiGroup.name);
      }
      let mockData = {};

      if(includeApis && !includeApis.includes(webapiGroup.name)) {
        console.log(
          `${i}/${ilen}`,
          'ignore webapiGroup:',
          webapiGroup.name,
          'due to MoonConfig.api.include do not contain it'
        );
        continue;
      }

      function isNeedMock(controller:string,method:string):boolean {
        debugger;
        return isContain(defaulltMoonConfig.api.mock.mockApi,controller,method);
      }

        await MoonCore.WebApiGen.buildWebApi({
          webapiGroup,
          projectPath: apiDir,
          isNeedMock,
          beforeCompile: (apiItem: IWebApiDefinded) => {
            return apiItem;
          },
          resSchemaModify: async (
            schema: SchemaProps,
            apiItem: IWebApiDefinded,
            context: IWebApiContext
          ): Promise<SchemaProps> => {
            let _isNewMethod  = isNewMethod(context.webapiGroup.name, apiItem.name);
            if (_isNewMethod) {
              newMethods.push({
                controller: context.webapiGroup.name,
                method: apiItem.name
              });
            }
            //添加生成mock数据的流程;;
            let finalSchema = resSchemaModify(schema, apiItem, context);
            if (finalSchema) {
              //如果Schema有值,那么生成假数据
              let json = {};
              if (!isContain(defaulltMoonConfig.api.mock.ignoreApi,webapiGroup.name,apiItem.name)
              ) {
                //查看 是否需要翻译 , 只有当前是mock的, 及新接口才需要mock
                if(isContain(defaulltMoonConfig.api.mock.mockApi,webapiGroup.name,apiItem.name) || _isNewMethod) {
                  try {
                    console.log(
                      `当前Controller:  ${webapiGroup.name}:['${apiItem.name}'],如果过进入infinite loop . 请设置moon.config :api.mock.ignoreApi`
                    );

                    json = await MoonCore.fakeGen.genrateFakeData(
                      finalSchema,
                      context.webapiGroup.definitions
                    );
                    console.log('fake data!!');
                  } catch (err) {
                    //TODO 这里把出错的数据记录下来后面分析出错的原因;;
                    console.error(err, '解析数据出错;;');
                  }
                }
              } else {
                fse.writeFileSync(join(workBase,"mock-err"+webapiGroup.name+".json"), JSON.stringify({...finalSchema,definitions:context.webapiGroup.definitions}, null, 2));
              }
              mockData[
                (finalSchema.title || 'noneName').replace(/(«|»)/gi, '')
                ] = json;
            }
            return finalSchema;
          },
          beforeSave: (options: IFileSaveOptions, context: any) => {
            options.content = options.content
              .replace(
                `import sdk from "@api/sdk";`,
                `import * as sdk from './fetch';`
              )
              .replace(
                `import sdk from '@api/sdk';`,
                `import * as sdk from './fetch';`
              )
              .replace(/result\.data/gi, 'result.context');

            //在这里添加api TODO api中mock相关的操作, 应该在这里添加
            return Promise.resolve(options);
          }
        });

      let controllerName = MoonCore.StringUtil.toLCamelize(webapiGroup.name);
      let filePath = `./${webapiGroup.name}`;

      inserts.push({
        mark: "'whatwg-fetch';",
        isBefore: false,
        content: `import  ${controllerName} from '${filePath}';`,
        check: (content: string) => !content.includes(filePath)
      });

      inserts.push({
        mark: 'default {',
        isBefore: false,
        content: `${controllerName},`,
        check: (_, raw) => !raw.includes(filePath)
      });

      //保存mock数据;
      let mockFilePath = join(
        apiDir,
        'mock',
        webapiGroup.name + '.json'
      );
      log('保存mock api定义数据');
      fse.ensureFileSync(mockFilePath);
       let oldValue ={};
      try {
        log('读取oldvalue, 执行merge操作');
        oldValue = fse.readJsonSync(mockFilePath);
      } catch(err){

      } finally {
        fse.writeFileSync(mockFilePath, JSON.stringify(_.merge(mockData,oldValue), null, 2));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // await MoonCore.CompileUtil.insertFile(join(apiDir, 'index.ts'), inserts);
  //还是生成 一个总的 ?
  //转换

  //生成api索引文件::
  console.log('开始生成api索引文件,时间稍长,耐心等待');
  let indexInfo = MoonCore.TsIndex.genApiTsIndex({
    tsConfig: join(workBase, 'tsconfig.json'),
    apiDir: apiDir,
    apiSuffix: 'Controller'
  });
  log('保存api索引信息');

  if (newMethods.length > 0) {
    modifyAndSaveMoonConfig(newMethods);
  } else {
  }

  fse.writeFileSync(ApiIndexPath, JSON.stringify(indexInfo, null, 2));
})();

function modifyAndSaveMoonConfig(
  newMethods: { controller: string; method: string }[]
) {
  for (let i = 0, iLen = newMethods.length; i < iLen; i++) {
    let { controller, method } = newMethods[i];
    if (!defaulltMoonConfig.api.mock.mockApi[controller]) {
      defaulltMoonConfig.api.mock.mockApi[controller] = [];
    }

    if (!defaulltMoonConfig.api.mock.mockApi[controller].includes(method)) {
      defaulltMoonConfig.api.mock.mockApi[controller].push(method);
    }
  }
  console.log('保存.moon.config,更新mock接口信息');
  fse.writeFileSync(
    configFilePath,
    JSON.stringify(defaulltMoonConfig, null, 2)
  );
}


export interface IParam {
  name: string;
  in: string;
  description: string;
  required: boolean;
  type: string;
  default: string;
}

export interface Parameter {}

export interface Items {
  $ref: string;
  originalRef: string;
}

export interface Schema {
  type: string;
  items: Items;
}


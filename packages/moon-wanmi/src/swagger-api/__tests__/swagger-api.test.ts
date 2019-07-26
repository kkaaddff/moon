/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/7/26
 **/
import {tmpdir} from 'os';
import {join} from  'path';
import {readJSON,remove} from  'fs-extra';
import moonCore from  'moon-core';
import {resSchemaModify} from "../util";
import {IWebApiContext, IWebApiDefinded, IWebApiGroup, SchemaProps} from "../../../../core/declarations/typings/api";


describe('swaggerapi测试', () => {
  it('正常生成测试', async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    let targetDir = join(tmpdir(),"moon-temp",Math.random()+"");

    let webapiGroups:IWebApiGroup[] = await readJSON(join(__dirname,"webapi-defs.json"));


    for (let i = 0, iLen = 10; i < iLen; i++) {
      let webapiGroup = webapiGroups[i];

      await moonCore.WebApiGen.buildWebApi({
        webapiGroup,
        projectPath: targetDir,
        beforeCompile: (apiItem: IWebApiDefinded) => {
          return apiItem;
        },
        resSchemaModify: async (
          schema: SchemaProps,
          apiItem: IWebApiDefinded,
          context: IWebApiContext
        ): Promise<SchemaProps> => resSchemaModify(schema, apiItem, context),
      });
    }

    let content  =  await moonCore.JestUtil.readDirFiles(targetDir);
    expect(content).toMatchSnapshot();
    await remove(targetDir);

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });
});

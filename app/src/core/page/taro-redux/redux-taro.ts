/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/3/19
 **/
import * as ejs from 'ejs';
import {join} from 'path';
import * as fse from 'fs-extra';
import {DataType, IAction, IActorEvent, IActorItem, IPageDefined, ISubComp,} from './generate';
import {insertContent, getHandleFile} from "../../util/compile-util";
import * as stringUitl from  '../../util/string-util';
const Util = {
  ... stringUitl,

  getDefaultByType(type: DataType) {
    switch (type) {
      case 'any':
        return "{}";
        break;
      case 'string':
        return "''";
        break;
      case 'object':
        break;
        return "{}"
      case 'string[]':
        break;
      case 'number':
        break;
        return "0";
      default:
        return "any";
    }
  },
};


export async function generate(pageInfo: IPageDefined) {
  //所有的事件..
  let events = pageInfo.actors.reduce(
    (accumulator: IActorEvent[], currentValue: IActorItem) => {
      // console.log(`accumulator:${accumulator}, currentValue:${currentValue}`);
      return accumulator.concat(currentValue.events);
    },
    [],
  );

  let handlePage = getHandleFile({outDir:"join('/Users/dong/extraIn/RHourseO2O/src/pages/', pageInfo.pagePath)"
      ,tplBase:join(__dirname,"tpl")
    });

  let base = {
    pageInfo,
    Util,
    className: Util.toUCamelize(pageInfo.pageKey),
    instanceName: Util.toLCamelize(pageInfo.pageKey),
    events,
  };
  //首页生成
  await handlePage('index.tsx.tpl', async (tplConent: string) => {
    let conent = ejs.render(tplConent, {
      ...base,
    });
    return conent;
  });

  await handlePage('index.less.tpl', async (tplConent: string) => {
    let conent = ejs.render(tplConent, {
      ...base,
    });
    return conent;
  });

  pageInfo.actors.forEach(async (actor: IActorItem, index: number) => {
    //reducer生成
    await handlePage(
      'reducer.ts.tpl',
      async (tplConent: string) => {
        let conent = ejs.render(tplConent, {
          ...base,
          actor,
          index,
        });
        return conent;
      },
      {saveFilePath: actor.fileName + '.ts'},
    );
  });

  //constant生成
  await handlePage('constant.ts.tpl', async (tplConent: string) => {
    let conent = ejs.render(tplConent, {
      ...base,
      events,
    });
    return conent;
  });

  //types生成
  await handlePage('types.ts.tpl', async (tplConent: string) => {
    let conent = ejs.render(tplConent, {
      ...base,
    });
    return conent;
  });

  //action生成
  pageInfo.actions.forEach(async (action: IAction) => {
    await handlePage(
      'action.ts.tpl',
      async (tplConent: string) => {
        let conent = ejs.render(tplConent, {
          ...base,
          action,
        });
        return conent;
      },
      {saveFilePath: action.fileName + '.ts'},
    );
  });

  //子组件生成;

  pageInfo.subComps.forEach(async (subComp: ISubComp, index: number) => {
    await handlePage(
      'components/sub-components.tsx.tpl',
      async (tplConent: string) => {
        let conent = ejs.render(tplConent, {
          ...base,
          subComp,
        });
        return conent;
      },
      {saveFilePath: 'components/' + subComp.fileName + '.tsx'},
    );

    await handlePage(
      'components/sub-components.less.tpl',
      async (tplConent: string) => {
        let conent = ejs.render(tplConent, {
          ...base,
          subComp,
        });
        return conent;
      },
      {saveFilePath: 'components/' + subComp.fileName + '.less'},
    );
  });
}

const tplBase = join(__dirname, 'tpl');

/**
 *
 * @param {string} filePath
 * @param {(tplContent: string) => Promise<string>} dealCal
 * @returns {Promise<void>}
 */

interface IContext {
  projectPath: string;
  pageInfo: IPageDefined;
}

export async function buildPage(context: IContext) {
  //在项目中生成相关文件
  let projectSrc = join(context.projectPath, 'src');
  let pageInfo = context.pageInfo;

  pageInfo.pageKey = pageInfo.pagePath.replace('/',"-");

  await generate(pageInfo);
  //在项目配置中添加store.reducer  及 页面显示的配置. ;
  //先判断是否有, 如果有的话, 不再重新生成了.

  //redux 框架简化添加流程;;

  let pagePath = join('pages', pageInfo.pagePath);
  let pageFilePath = join('@/', pagePath, 'reducer');

  await insertContent(join(projectSrc, 'reducers/index.ts'), [
    {
      mark: '//mark1//',
      isBefore: true,
      content: `import ${Util.toLCamelize(
        pageInfo.pageKey,
      )} from "${pageFilePath}";`,
      check: (content): boolean => !content.includes(pageFilePath),
    },
    {
      mark: '//mark2//',
      isBefore: false,
      content: Util.toLCamelize(pageInfo.pageKey) + ',',
      check: (content, rawContent): boolean =>
        !rawContent.includes(pageFilePath),
    },
  ]);

  await insertContent(join(projectSrc, 'app.tsx'), [
    {
      mark: '"pages/empty/index"',
      isBefore: true,
      content: `"${pagePath}/index",`,
      check: (content): boolean => !content.includes(pagePath),
    },
  ]);
}

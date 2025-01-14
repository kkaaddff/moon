import * as Type from '@/pages/moon/page/typings';
import {IProps} from '@/pages/moon/page/types';
import {InteractConfig} from '@/pages/moon/page/components/features/feature-util';
import imgcook from 'taro-imgcook';
import { IParseResult} from 'taro-imgcook/src/typings';


// 特性相关信息;
export const FeatureInfo = {
  code: 'UI:imgCook',
  name: 'imCook',
  //介绍站点
  descHref:"",
  //示例图片;
  pic:"将imgcook页面信息接入到项目中来",
  target:/redux/
};

//特性需要用户输入数据;
export const InterActData: {
  [key: string]: InteractConfig;
} = {
  "moduleId": {
    "interact": "input",
    "name": "ModuleId",
    "code": "moduleId"
  }
};

//这里正在做...
interface IData {
  [name:string]:any
}

/**
 *
 * */
export async function apply(context: IProps & {data: IData}) {
  let {actions: {action}, main: { pageInfo }} = context;
  let { moduleId } = context.data;

  let api = window.moon.api;
  const uiRes: IParseResult = await imgcook({
    moduleId: moduleId,
    pagePath: pageInfo.pagePath,
    fsExtra: api.fsExtra,
    urllib: api.urllib,
    pwd: window.moon.context.pwd
  });

  // 生成子组件
  uiRes.subComps.forEach(async (uiComp, idx) => {
    await action.componentAdd();
    let index = pageInfo.subComps.length + idx;
    action.commonChange(`main.pageInfo.subComps.${index}.imports`, uiComp.imports);
    action.commonChange(`main.pageInfo.subComps.${index}.style`, uiComp.style);
    action.commonChange(`main.pageInfo.subComps.${index}.fileName`, uiComp.componentName);
    action.commonChange(`main.pageInfo.subComps.${index}.methods.0.content`, uiComp.vdom);
  });

  // 填充主组件
  const methodIndex = pageInfo.mainComp.methods.findIndex(m => m.name === 'render');
  if (methodIndex == -1) {
    pageInfo.mainComp.methods.push({
      name: 'render',
      content: uiRes.mainComp.vdom
    });
    action.commonChange(`main.pageInfo.mainComp.methods`, pageInfo.mainComp.methods);
  } else {
    action.commonChange(`main.pageInfo.mainComp.methods.${methodIndex}.content`, uiRes.mainComp.vdom);
  }
  action.commonChange(`main.pageInfo.mainComp.imports`, uiRes.mainComp.imports);
  action.commonChange(`main.pageInfo.mainComp.style`, uiRes.mainComp.style);


}

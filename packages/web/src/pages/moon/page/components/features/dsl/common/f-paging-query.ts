import {
  EInterActType,
  IActionInfo,
  IActorDataItemInfo,
  IActorInfo,
  ICompMethodInfo,
  ImportInfo
} from '@/pages/moon/page/typings';
import { IProps } from '@/pages/moon/page/types';

/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/6/4
 **/

//交互类型;//

// 特性相关信息;
export const FeatureInfo = {
  code:"Logic:PagingFeature",
  name:"[逻辑]列表查询",
  //介绍站点
  descHref:"/images/moon/f-paging-query.png",
  //示例图片;
  pic:"/images/moon/f-paging-query.png",
  target:/.*/
}

//特性需要用户输入数据;
export const InterActData = {
  key:{
    name:"Key[option]",
    interact:EInterActType.input
  },
  actionInfo:{
    name:"目标action",
    interact:EInterActType.actionChoose
  },
  actorInfo:{
    name:"目标actor",
    interact:EInterActType.actorChoose
  },
  apiInfo:{
    name:"调用api接口",
    interact:EInterActType.apiMethodTypeChoose
  }
  // visibleVar:{
  //   name:"显示控制变量(reducer)(option)",
  //   interact:EInterActType.actorDataChoose
  // },
}

interface IDialogData{
  key?:string;
  actionInfo:IActionInfo;
  actorInfo:IActorInfo;
  apiInfo:ImportInfo;
}

/**
 * 添加弹窗ui
 * 添加弹窗显示与否变量关联;
 * 添加确定与取消方法的处理;
 *
 * */
export async function apply(context:IProps & {data:IDialogData}) {
  let {actionInfo,actorInfo} = context.data;

  let tplInfo = getContent(context.data);

  tplInfo.actor.datas.forEach(item =>
    context.actions.action.actorMethodAdd(actorInfo.actorIndex, 'datas', item),
  );

  tplInfo.actor.events.forEach(item =>
    context.actions.action.actorMethodAdd(actorInfo.actorIndex, 'events', item),
  );

  tplInfo.action.methods.forEach(item =>
    context.actions.action.actionMethodAdd(actionInfo.actionIndex, item),
  );
}


function getContent(data:IDialogData) {

  let {key=""} = data;
  let {methodName,apiFile,interfaceName,isArray} =  data.apiInfo?data.apiInfo:{
    methodName:"XXapi"
    ,apiFile:"",interfaceName:"",isArray:false
  };

  return {
    actor: {
      datas: [
        {
          name: 'request'+key,
          value: {
            q: '',
            pageNum: 0,
            pageSize: 10,
          },
        },
        {
          name: 'total'+key,
          value: 0,
        },
        {
          name: 'list'+key,
          value: [],
          importInfo:data.apiInfo||undefined,
          schemaType:data.apiInfo?"import":"fromValue",
        },
      ],
      events: [
        {
          name: 'modifyRequest'+key,
          comment: '修改查询条件数据',
          content: `immerUtil.assign(draftState.request${key},payload);`,
          param: '',
        },
        {
          name: 'cleanList'+key,
          comment: '清空查询结果',
          content: `draftState.list${key} = [];`,
          param: '',
        },
        {
          name: 'queryResult'+key,
          comment:"",
          content: `draftState.list${key} = payload.list;
        draftState.total${key} = payload.total;
        `,
          param: '',
        },
      ],
    },
    action: {
      methods: [
        {
          name: 'modifySearch'+key,
          comment: `
              普通条件查询可以走,commonChange
              `,
          content: `
      dispatch({ type: Command.modifyRequest${key}, payload: param});
      //修改完直接查询;
      if(options.isQuery) {
        await this.query${key}(options.isResetPage)
      }
      `,
          param: `param,options:{
      isQuery:boolean;
      isResetPage:boolean;
    }={isQuery:true,isResetPage:false}`,
        },
        {
          name: 'nextPage'+key,
          comment: '查询下一页',
          param: '',
          content: `
      let {request${key}} = getData().main;
      request${key}.pageNum=request${key}.pageNum+1;
      dispatch({ type: Command.modifyRequest${key}, payload: request });
      await this.query${key}();
              `,
        },
        {
          name: 'query'+key,
          comment: '以当前查询条件查询',
          param: 'isResetPage:boolean=false',
          content: `
            if(isResetPage) {
              await dispatch({ type: Command.modifyRequest${key}, payload: {pageNum:0} });
            }
          
          let {request${key}} =  getData().main;
      //TODO 接口缺失 
      // let {} = await api.${apiFile}.${methodName}();
      
      dispatch({ type: Command.queryResult${key}, payload: {
        total:0,
        list:[]
        } });
        `,
        },
      ],
    },
  };
};
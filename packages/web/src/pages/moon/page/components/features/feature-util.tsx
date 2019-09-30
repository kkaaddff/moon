/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/6/4
 **/
import * as React from 'react';
import {Modal, Select, Input} from 'antd';
import {EInterActType} from '../../typings';
import CompMethodChoose from '../common/comp-method-choose';
import CompChoose from '../common/comp-choose';
import ApiMethodTypeChoose from '../common/api-method-type-choose';
import ApiMethodChoose from '../common/api-method-choose';
import ActorDataChoose from '../common/actor-data-choose';
import ActorEventChoose from '../common/actor-event-choose';
import ActorChoose from '../common/actor-choose';
import ActionChoose from '../common/action-choose';
import ActionMethodChoose from '../common/action-method-choose';
import CheckBoxChoose from '../common/checkbox-choose';
import ArrayChoose from '../common/array-choose';
import BooleanChoose from '../common/boolean-choose';
import ObjectChoose from '../common/object-choose';
import RadioChoose from '@/pages/moon/page/components/common/radio-choose';

export type InteractConfig =InteractConfigBasic | InteractConfigArray |InteractConfigCheckBox|InteractConfigBoolean|InteractConfigObject;


/**
 * 获取代码模式的dsl配置
 * 可以直接为配置信息, 或是通过方法获取; 方法中可以
 * @param {object | Function} param
 * @param option
 * @returns {Object}
 */
export function getInterActData(param:object|Function,option={}):Object{
  if(typeof( param )=== 'function' ) {
    return param(option);
  } else {
    return param;
  }
}

export interface InteractConfigBasic{
  name: string;
  code?:string;//唯一标识
  interact: EInterActType;
}

/**
 * 数组选项设置信息;
 */
export interface InteractConfigArray extends InteractConfigBasic{
  //array类型需要这个定义;
  childrenInteract?: InteractConfigBasic;
}



/**
 * 数组选项设置信息;
 */
export interface InteractConfigBoolean extends InteractConfigBasic{
  //array类型需要这个定义;
  childrenInteract?: InteractConfigBasic;
}

/**
 * 对象类型的处理
 */
export interface InteractConfigObject extends InteractConfigBasic{
  //array类型需要这个定义;
  childrenInteract?:{
    [valName:string]:InteractConfig
  };
}

/**
 * checkbox选项设置信息;
 */
export interface InteractConfigCheckBox extends InteractConfigBasic{
  //array类型需要这个定义;
  datas?: {name: string; value: string}[];
}



/**
 * checkbox选项设置信息;
 */
export interface InteractConfigRadio extends InteractConfigBasic{
  //array类型需要这个定义;
  datas?: {name: string; value: string}[];
}

export interface InteractOnChange {
  (value: any): void;
}
/**
 * 根据配置规则生成,设置特性的组件;;
 *
 *
 */
export function generateInteractEle(
  interactConfig: InteractConfig,
  onChange: InteractOnChange,
) {

  if(!interactConfig){
    console.warn('interactConfig is null ,please check config');
    return null;
  }


  switch (interactConfig.interact) {
    case EInterActType.objectChoose:
      let _interactConfigObject=  interactConfig as InteractConfigObject;
      return (
        <div key={_interactConfigObject.code} >
          <span>{_interactConfigObject.name}</span>
          <ObjectChoose
            childrenInteract={_interactConfigObject.childrenInteract}
            onChange={onChange}
          />
        </div>
      );
    case EInterActType.booleanChoose:
      let _interactConfigBoolean=  interactConfig as InteractConfigBoolean;
      return (
        <div key={_interactConfigBoolean.code} className="interLine" >
          <span>{_interactConfigBoolean.name}</span>
          <BooleanChoose
            childrenInteract={_interactConfigBoolean.childrenInteract}
            onChange={onChange}
          />
        </div>
      );

    case EInterActType.arrayChoose:
      let _interactConfig =  interactConfig as InteractConfigArray;
      return (
        <div key={_interactConfig.code} >
          <span>{_interactConfig.name}</span>
          <ArrayChoose
            childrenInteract={_interactConfig.childrenInteract}
            onChange={onChange}
          />
        </div>
      );
      case EInterActType.radioChoose:
      let _interactConfigRadio = interactConfig as InteractConfigRadio ;
      return (
        <div key={_interactConfigRadio.code} >
          <span>{_interactConfigRadio.name}</span>
          <RadioChoose
            datas={_interactConfigRadio.datas}
            onChange={onChange}
          />
        </div>
      );

      case EInterActType.checkboxChoose:
      let _interactConfigCheckbox = interactConfig as InteractConfigCheckBox ;
      return (
        <div key={_interactConfigCheckbox.code} >
          <span>{_interactConfigCheckbox.name}</span>
          <CheckBoxChoose
            datas={_interactConfigCheckbox.datas}
            onChange={onChange}
          />
        </div>
      );

    case EInterActType.actionMethodChoose:
      return (
        <div key={interactConfig.code} className="interLine">
          <span>{interactConfig.name}</span>
          <ActionMethodChoose onChange={onChange} />
        </div>
      );

    case EInterActType.actionChoose:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>
          <ActionChoose onChange={onChange} />
        </div>
      );
    case EInterActType.actorChoose:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>
          <ActorChoose onChange={onChange} />
        </div>
      );

    case EInterActType.input:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>
          <div><Input
            onChange={e => {
              let value = e.target.value;
              onChange(value);
            }}
          /></div>
        </div>
      );

    case EInterActType.actorEventChoose:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>
          <ActorEventChoose onChange={onChange} />
        </div>
      );
    case EInterActType.actorDataChoose:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>
          <ActorDataChoose onChange={onChange} />
        </div>
      );

    case EInterActType.compChoose:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>
          <CompChoose onChange={onChange} />
        </div>
      );
    case EInterActType.compMethodChoose:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>
          <CompMethodChoose onChange={onChange} />
        </div>
      );

    case EInterActType.apiMethodTypeChoose:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>
          <ApiMethodTypeChoose onChange={onChange} />
        </div>
      );
    case EInterActType.apiMethodChoose:
      return (
        <div key={interactConfig.code}  className="interLine">
          <span>{interactConfig.name}</span>:
          <ApiMethodChoose onChange={onChange} />
        </div>
      );
    default:
      return <div>none for {interactConfig.name} </div>;
  }
}

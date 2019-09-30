/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/5/30
 **/

import * as React from 'react';
import {connect} from 'react-redux';
import {Button, Modal, Select,Switch} from 'antd';
import actions from '@/pages/moon/page/actions';
import {store2Props} from '@/pages/moon/page/selectors';
import * as T from '@/pages/moon/page/types';
import { IBooleanResult } from '@/pages/moon/page/typings';
import { generateInteractEle, InteractConfig } from '@/pages/moon/page/components/features/feature-util';


interface IBooleanChooseP {
  onChange: ( result:IBooleanResult) => void;
  childrenInteract:InteractConfig;
  [name: string]: any;
}

interface IBooleanChooseS {
  checked: boolean;
  value?:any;
  [name: string]: any;
}

type IProps = T.IProps & IBooleanChooseP;
@connect(store2Props, actions)
export default class BooleanChoose extends React.Component<
  Partial<IProps>,
  IBooleanChooseS
> {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
  }
  componentDidMount(){
    //默认数据传递出去.  TODO 考虑数据这样传递出去是否合理. 如果通过props 外部值呢
    this._trigger();
  }
  render() {
    let {actions: {action}, main} = this.props;
    return (
      <div className={"booleanChoose"}>
        <Switch defaultChecked onChange={this._checked} />
        <div className={"subItems"}>
        {
          this.state.checked? generateInteractEle(this.props.childrenInteract,(value)=>{
            this.setState({value},this._trigger);
          }):null
        }
        </div>
      </div>
    );
  }

  _checked=(checked:boolean)=>{
    this.setState({
      checked
    },this._trigger);
  }

  /**
   * 通知外部数据发生变化;
   * @private
   */
  _trigger=()=>{
    this.props.onChange(this.state);
  }
}


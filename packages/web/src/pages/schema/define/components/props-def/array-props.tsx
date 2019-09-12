/**
 * @desc
 *
 * @使用场景
 *
 * @company qianmi.com
 * @Date    2019/6/29
 **/

import * as React from 'react';
import {Menu, Dropdown, Icon, Input} from 'antd';
import {getChooseableComp, getPropsComp} from '../props-util';

interface ICheckboxPropsP {
  onChange: (
    param: {
      type: string;
      name: string;
      datas: {name: string; value: string}[];
    },
  ) => void;
  [name: string]: any;
}

interface ICheckboxPropsS {
  [name: string]: any;
}

export default class ArrayProps extends React.Component<
  ICheckboxPropsP,
  ICheckboxPropsS
> {
  constructor(props) {
    super(props);
    this.state = {};
    this._notify();
  }

  componentDidMount() {}

  render() {
    const menu = (
      <Menu onClick={this._handleMenuClick}>
        {getChooseableComp().map(item =>
          <Menu.Item key={item}>{item}</Menu.Item>,
        )}
      </Menu>
    );

    let Comp = getPropsComp(this.state.propsType);
    return (
      <div>
        <div>
          当前子属性为:{JSON.stringify(this.state.childrenInteract,null,2)}
        </div>
        选择子项类型:
        <Dropdown
          overlay={menu}
          onVisibleChange={this._handleVisibleChange}
          visible={this.state.visible}
        >
          <a className="ant-dropdown-link" href="javascript:void(0)">
            选择添加属性类型
          </a>
        </Dropdown>
        <Comp onChange={this._onChange} />
      </div>
    );
  }

  _onChange = param => {
    this.setState({childrenInteract: param},this._notify);
  };

  _handleMenuClick = e => {
    this.setState({
      visible: false,
      propsType: e.key,
    });
  };

  _handleVisibleChange = flag => {
    this.setState({visible: flag});
  };

  _notify = () => {
    this.props.onChange && this.props.onChange({
      interact: 'array',
      childrenInteract: this.state.childrenInteract,
    });
  };
}

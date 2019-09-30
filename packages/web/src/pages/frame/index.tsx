import * as React from 'react';
import {connect} from 'react-redux';
import './index.less';
import * as T from './types';
import actions from './actions';
import {store2Props} from './selectors';

import LeftMenu from './components/left-menu';
import { Layout, Menu, Dropdown, Icon } from 'antd';
const { Header, Content } = Layout;

@connect(
  store2Props,
  actions
)
class Frame extends React.Component<T.IProps, any> {

  render() {
    return (
      <Layout className="frame">
        <Header className="header">
          <div className="logo" />
          {/*<Menu*/}
            {/*theme="dark"*/}
            {/*mode="horizontal"*/}
            {/*defaultSelectedKeys={['2']}*/}
            {/*style={{ lineHeight: '64px' }}*/}
          {/*>*/}
            {/*<Menu.Item key="1">nav 1</Menu.Item>*/}
            {/*<Menu.Item key="2">nav 2</Menu.Item>*/}
            {/*<Menu.Item key="3">nav 3</Menu.Item>*/}
          {/*</Menu>*/}
        </Header>
        <Layout hasSider>
          <LeftMenu />
          <Content className="page-container">
            <div className="container">
              {this.props.children}
            </div>
            <div>
             issue: https://github.com/creasy2010/moon/issues
             fork:  https://github.com/creasy2010/moon
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default Frame as any ;
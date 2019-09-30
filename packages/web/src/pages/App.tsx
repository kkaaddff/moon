import React from 'react';
import 'whatwg-fetch';
import {HashRouter as Router, Route, Link, match,Switch} from 'react-router-dom';
import loadable from '@loadable/component'

const MainFrame = loadable(() => import('@/pages/frame'));
const Main = () =>
  <Router>
    <Switch>
      <Route path="/" render={() => <MainFrame>
        <Route path="/" exact={true} component={()=><div>
          hello welcome to moon
          <br/>
          issue: https://github.com/creasy2010/moon/issues
          <br/>
          fork:  https://github.com/creasy2010/moon
        </div>} />
        <Route exact={true}  path="/moon/page" component={loadable(() => import('@/pages/moon/page'))} />
        <Route exact={true}  path="/moon/list" component={loadable(() => import('@/pages/moon/list'))} />
        <Route exact={true}  path="/schema/define" component={loadable(() => import('@/pages/schema/define'))} />
      </MainFrame>} />
    </Switch>
  </Router>;

interface ITopicProps {
  topicId: string;
}

interface IProps {
  match: match<ITopicProps>;
}

export default Main;

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';

import * as angular from 'angular';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import angularApollo, { Apollo, ApolloProvider } from 'angular1-apollo';
import gql from 'graphql-tag';

import './utils';

import { client } from './apollo';

class AppComponent {
  nameFilter: Subject<string> = new Subject<string>();
  name: string = '';
  users: any[];
  usersObs: any;

  static $inject: string[] = ['apollo', '$scope'];
  
  constructor(
    private apollo: Apollo,
    private $scope: angular.IScope,
  ) {}

  $onInit() {
    this.usersObs = this.apollo.watchQuery({
      query: gql`
        query getUsers($name: String) {
          users(name: $name) {
            firstName
            lastName
            emails {
              address
              verified
            }
          }
        }
      `,
      variables: {
        name: this.nameFilter,
      },
    })
    .observeOnScope(this.$scope)
    .map(result => result.data.users);
    
    this.usersObs.subscribe((users) => {
      this.users = users;
    });

    this.nameFilter.next(this.name);

    setTimeout(() => {
      console.log('Polling: start');
      this.usersObs.startPolling(500);
    }, 500);

    setTimeout(() => {
      console.log('Polling: stop');
      this.usersObs.stopPolling();
    }, 3500);
  }

  onNameChange() {
    this.nameFilter.next(this.name);
  }
}

angular.module('app', [
  angularApollo
])
  // Config
  .config(['apolloProvider', config])
  // AppComponent
  .component('app', {
    template: `
      <h1>Hello World</h1>
      <h2>List</h2>

      <input 
        name="name"
        placeholder="Filter by name" 
        ng-model="$ctrl.name" 
        ng-model-options="{debounce: 200}"
        ng-change="$ctrl.onNameChange($event)
      "/>

      <ul>
        <li ng-repeat="user in $ctrl.users track by $index">
          {{user.firstName}} {{user.lastName}}
        </li>
      </ul>
    `,
    controller: AppComponent
  });

function config(apolloProvider: ApolloProvider) {
  apolloProvider.defaultClient(client);
}

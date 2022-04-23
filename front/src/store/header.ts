// import { createStore } from 'vuex'

// export default createStore({
//   state: {
//   },
//   mutations: {
//   },
//   actions: {
//   },
//   modules: {
//   }
// })

import { reactive, readonly } from 'vue';
import { RouteLocationNormalizedLoaded } from 'vue-router';

const state: { navigation: Array<{ path: string, name: string, parents: string[] }> } = reactive({
  navigation: [],
});

const changeNavigation = (route: RouteLocationNormalizedLoaded) => {
  state.navigation = (route.matched.map((match) => {
    return {
      path: match.path,
      name: match.name,
      parents: match.meta.parentPageName,
    };
  }) as Array<{ path: string, name: string, parents: string[] }>);
};

export default {
  state: readonly(state),
  changeNavigation,
};

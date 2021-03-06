import { UserCredentials, UserProfile } from "@/store/types";
import firebase from "firebase";
import { ActionTree } from "vuex";
import { Actions, ActionTypes } from "./action-types";
import { State as RootState } from "@/store";
import { State } from "../state";
import { MutationTypes } from "../mutations/mutation-types";
import axios from "axios";

export const actions: ActionTree<State, RootState> & Actions = {
  [ActionTypes.SIGN_UP](context, payload: UserCredentials) {
    const { email, password } = payload;
    return firebase
      .app()
      .auth()
      .createUserWithEmailAndPassword(email, password);
  },
  async [ActionTypes.SIGN_IN](context, payload: UserCredentials) {
    const { email, password } = payload;
    await firebase.app().auth().signInWithEmailAndPassword(email, password);
  },
  async [ActionTypes.LOG_OUT]({ commit }) {
    commit(MutationTypes.SET_USER, null);
    commit(MutationTypes.SET_PROFILE, null);
    commit(MutationTypes.SET_PLAN, null);
    await firebase.app().auth().signOut();
  },
  [ActionTypes.CREATE_PROFILE](context, payload) {
    const currentUser = context.state.currentUser;
    if (!payload || !currentUser) return;

    firebase.database().ref(currentUser.uid).child("profile").set(payload);
  },
  [ActionTypes.LOAD_PROFILE](context) {
    return new Promise((resolve) => {
      const currentUser = context.rootState.auth.currentUser;
      if (!currentUser) return resolve();

      firebase
        .database()
        .ref(currentUser.uid)
        .child("profile")
        .on("value", (snapshot) => {
          const profile = snapshot.val() as UserProfile | null;
          if (profile === null) return;

          context.commit(MutationTypes.SET_PROFILE, profile);
          resolve();
        });
    });
  },
  async [ActionTypes.GET_USER_SUBSCRIPTION_PLAN](context) {
    const userId = context.state.currentUser?.uid;
    if (!userId) return;

    const middlewareURL = new URL(
      `${process.env.VUE_APP_SERVER_HOST}/api/users/getUserSubscriptionPlan`
    );
    middlewareURL.searchParams.set("userId", userId);

    const response = await axios.get(middlewareURL.href);
    context.commit(MutationTypes.SET_PLAN, response.data);
  },
  async [ActionTypes.SET_AUTHORIZATION_HEADER](context, config) {
    const user = context.state.currentUser;
    const { headers } = config;
    if (!user || headers.common.Authorization) return;

    const token = await user.getIdToken();
    return new Promise((resolve) => {
      headers.common.Authorization = `Bearer ${token}`;
      resolve(config);
    });
  },
};

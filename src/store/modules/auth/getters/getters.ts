import { GetterTree } from "vuex";
import { State as RootState } from "@/store";
import { State } from "../state";
import { Getters } from "./getter-types";
import { UserPlanTypes } from "@/store/types";

export const getters: GetterTree<State, RootState> & Getters = {
  isUserAuthenticated(state) {
    return state.currentUser !== null;
  },
  /* TODO: remove 'user profile' getter */
  userProfile(state) {
    return state.userProfile;
  },
  isUserPremium(state) {
    return (
      state.userProfile?.plan?.type === UserPlanTypes.PREMIUM_PLAN || false
    );
  },
};

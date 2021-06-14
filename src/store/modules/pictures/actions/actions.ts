import { State } from "../state";
import { Actions, ActionTypes } from "./action-types";
import firebase from "firebase";
import { ActionTree } from "vuex";
import { DbRecord } from "@/utils/createDbRecord";
import { Pictures } from "@/store/types";
import { MutationTypes } from "../mutations/mutation-types";
import { State as RootState } from "@/store";

export const actions: ActionTree<State, RootState> & Actions = {
  async [ActionTypes.SAVE_PICTURE](context, payload: DbRecord | undefined) {
    const currentUser: firebase.User | null =
      context.rootState.auth.currentUser;
    if (!payload || !currentUser) return;

    await firebase
      .database()
      .ref(currentUser?.uid)
      .child("pictures")
      .push(payload);
  },
  async [ActionTypes.LOAD_PICTURES](context) {
    const { currentUser } = context.rootState.auth;
    if (!currentUser) return;

    try {
      await firebase
        .database()
        .ref(currentUser.uid)
        .child("pictures")
        .on("value", (snapshot) => {
          let pictures: Pictures = snapshot.val();
          if (pictures === null) pictures = {};
          context.commit(MutationTypes.SET_PICTURES, pictures);
          console.log(
            "%cPictures have been loaded!",
            "color:#67FF3D",
            pictures
          );
        });
    } catch (error) {
      console.error(error);
    }
  },
  [ActionTypes.GET_PUBLIC_PICTURES](context) {
    firebase
      .database()
      .ref("PublicPictures")
      .on("value", (snapshot) => {
        const publicPictures = snapshot.val() as { [key: string]: string };
        context.commit(MutationTypes.SET_PUBLIC_PICTURES, publicPictures);
      });
  },
  [ActionTypes.ADD_PUBLIC_PICTURE](context, payload) {
    if (!payload) return;

    firebase.database().ref("PublicPictures").push(payload);
  },
  [ActionTypes.UPDATE_PUBLIC_PICTURES](context) {
    const pictures = context.state.publicPictures;

    firebase.database().ref("PublicPictures").set(pictures);
  },
};

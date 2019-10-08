import { getChat } from "../store/chats";
import { reestarConnection, loading, loaded } from "../store/aplication";
import { getUserData } from "../database/realmDatabase";
import { sha256 } from "js-sha256";

export let sendSocket = undefined;
/**
 *
 * websocket client management class
 * @export
 * @class Socket
 */
export default class Socket {
  constructor(store) {
    this.socket = new WebSocket("wss://lochat.coinlab.info");
    //this.socket = new WebSocket("wss://192.168.1.1");
    this.openSocketConnection();
    this.onMenssage();
    this.store = store;
    sendSocket = this.socket;
    this.checkingSocketStatus(store);
  }

  /**
   * @function
   * @description websocket client management class
   * @memberof Socket
   */

  checkingSocketStatus = store => {
    setInterval(() => {
      if (this.socket.readyState !== 1) {
        this.store.dispatch(loading());
      } else {
        store.getState().aplication.loading === false
          ? null
          : this.store.dispatch(loaded());
      }
    }, 1000);
  };

  /**
   * @function
   * @description Sending messages
   * @memberof Socket
   */
  sendMenssage = data => {
    this.socket.send(data);
  };

  /**
   * @function
   * @description makes a request to the database looking for user data to pass them to the initial connection
   * @param {callback} callback
   * @memberof Socket
   */

  getUserObject = callback => {
    getUserData().then(res => {
      const object = {
        hashUID: sha256(res[0].uid),
        timestamp: new Date().getTime(),
        type: "handshake"
      };
      callback(object);
    });
  };

  /**
   * @function
   * @description start the connection to the socket
   * @memberof Socket
   */

  openSocketConnection = async () => {
    this.getUserObject(res => {
      this.store.dispatch(loading());
      this.socket.onopen = () => {
        console.log("conecto");
        this.socket.send(JSON.stringify(res));
      };
    });
  };

  /**
   *
   * @function
   * @description contains the onMessage, onError and onClose of the webscket
   * @memberof Socket
   */
  onMenssage = () => {
    this.socket.onmessage = e => {
      // a message was received
      this.store.dispatch(getChat(e.data));
    };

    this.socket.onerror = e => {
      // a message was received
      console.log("OnError", e);
    };

    this.socket.onclose = e => {
      console.log("close", e);
      this.store.dispatch(reestarConnection);
    };
  };
}

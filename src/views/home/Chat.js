import React, { Component } from 'react';
import { Container } from 'native-base';
import { connect } from 'react-redux';
import {
  Alert, Clipboard, Dimensions, KeyboardAvoidingView, Platform, View,
} from 'react-native';
import { verifyImage } from '../../store/contacts/contactsActions';
import Header from '../../components/Header';
import ChatBody from './ChatBody';
import ChatForm from './ChatForm';
import { toast } from '../../utils/utils';
import {
  initialChat,
  cleanAllChat,
  sendMessageWithFile,
  deleteMessages,
  setView,
  sendReadMessageStatus,
  sendAgain,
  setNewDials
} from '../../store/chats';
import { messageType } from '../../utils/constans';

import ImagesView from './imagesView';
import { bitcoin, chatService } from '../../../App';


const ChatContainer = Platform.select({
  ios: () => KeyboardAvoidingView,
  android: () => View
})();

/**
 * main message component
 */

class Chat extends Component {
  /**
   *Creates an instance of Chat.
   * @param {Object} props optional
   * @memberof Chat
   */

  constructor(props) {
    super(props);

    this.interval = null;
    this.state = {
      selected: [],
      isConnected: false,
      seconds: 0,
      imagesView: [],
      fileModal: false,
      menu: [
        {
          label: `${this.props.screenProps.t('Chats:clean')}`,
          action: (data) => this.cleanAllMessages(data),
          broadcast: true
        }
      ]
    };
  }

  eventConnected = () => {
    chatService.event.addListener('connectionEstablished', ({ peer, numEstablished }) => {
      const chatSelected = this.props.chat[this.props.chatSelected.index].toUID;
      if (
        peer === chatSelected
        && this.state.isConnected !== true
      ) {
        this.setState({
          isConnected: true
        });
        clearInterval(this.interval);
      }
    });
  }

  eventDisconnected = () => {
    chatService.event.addListener('connectionClosed', ({ peer, numEstablished, cause }) => {
      const chatSelected = this.props.chat[this.props.chatSelected.index].toUID;
      if (
        peer === chatSelected
        && this.state.isConnected !== false
      ) {
        this.setState({
          isConnected: false
        });
        this.reconnect();
      }
    });
  }


  errorConnection = () => {
    chatService.event.addListener('unknownPeerUnreachableAddr', (data) => {
      if (!this.interval) {
        this.reconnect();
      }
    });
  }

  reconnect = () => {
    const { nodeAddress } = this.props.navigation.state.params;
    this.interval = setInterval(() => {
      if (this.state.seconds < 8) {
        this.setState({
          seconds: this.state.seconds + 1
        });
      } else {
        const adress = nodeAddress;
        this.props.setNewDials(adress, () => { });
        this.setState({
          seconds: 0
        });
      }
    }, 1000);
  }

  componentDidMount = () => {
    const chatSelected = this.props.chat[this.props.chatSelected.index].toUID;
    const contactNodeAddress = this.props.navigation.state.params.nodeAddress;
    this.eventConnected();
    this.eventDisconnected();
    this.errorConnection();
    this.props.setView(chatSelected, contactNodeAddress);
  };

  /**
   *
   * static variable of the React Navigation
   * @static
   * @memberof Chat
   */
  // eslint-disable-next-line react/sort-comp
  static navigationOptions = {
    header: null
  };

  /**
   * function belonging to the menu its function is to delete all messages from the selected chat
   * @function
   * @memberof Chat
   */
  cleanAllMessages = (close) => {
    const { screenProps } = this.props;
    const chat = this.props.chat[this.props.chatSelected.index];
    Alert.alert(
      `${screenProps.t('Chats:titleDelete')}`,
      `${screenProps.t('Chats:deleteBody')}`,
      [
        {
          text: 'Cancel',
          onPress: () => { close(); },
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => this.props.cleanAllChat(chat.toUID)
        }
      ],
      { cancelable: false }
    );
  };


  /**
   * function executes when pressing a message
   * @param {Message} item
   * @param {string} item.fromUID uid of who sends the message
   * @param {string} item.id message id
   * @param {string} item.msg  message text
   * @param {string | null}  item.name name of who send the message
   * @param {number} item.timestamp message timestamp
   * @param {string | null} item.toUID  uid of who receive the message
   * @param {string} item.type type message
   * @param {{fileType: string, file: string}} item.file path where the file is saved and file type
   * @function
   * @public
   * @memberof Chat
   */

  onClick = (item) => {
    if (this.state.selected.length > 0) {
      const result = this.state.selected.filter((selected) => item.id !== selected.id);

      if (result && result.length !== this.state.selected.length) {
        this.setState({
          selected: result
        });
      } else {
        this.setState({ selected: this.state.selected.concat(item) });
      }
    } else if (item.file && item.file.fileType !== 'audio') {
      this.setState({
        imagesView: [
          {
            url: item.file.file,
            width: Dimensions.get('window').width
          }
        ]
      });
    }
  };

  /**
   * function used to select messages
   * @param {Object} item
   * @param {string} item.fromUID uid of who sends the message
   * @param {string} item.id message id
   * @param {string} item.msg  message text
   * @param {string | null}  item.name name of who send the message
   * @param {number} item.timestamp message timestamp
   * @param {string | null} item.toUID  uid of who receive the message
   * @param {string} item.type type message
   * @param {{fileType: string, file: string}} item.file path where the file is saved and file type
   * @function
   * @public
   * @memberof Chat
   */
  onSelected = (item) => {
    this.setState({
      selected: this.state.selected.concat(item)
    });
  };

  // ----------------- Actions headers  -----------

  back = () => {
    this.setState({ selected: [] });
  };

  copy = () => {
    const { selected } = this.state;

    Clipboard.setString(selected[this.state.selected.length - 1].msg);
    toast('Mensaje copiado');
  };

  delete = () => {
    const chatSelected = this.props.chat[this.props.chatSelected.index];
    this.props.deleteMessages(chatSelected.toUID, this.state.selected, () => {
      this.setState({ selected: [] });
    });
  };

  // -----------------------------------------

  /**
   * open the file selection modal
   * @function
   * @memberof Chat
   */

  openFileModal = () => {
    this.setState({ fileModal: true });
  };

  /**
   * open the file selection modal
   * @function
   * @memberof Chat
   */

  closeFileModal = () => {
    this.setState({ fileModal: false });
  };

  /**
   * Prepare the message structure before being sent
   * @param { obj } data
   * @param {array<obj>} data.images contains the list of images
   * @param {number} data.position array position where the comment will be written
   * @param {string} data.message text to send
   * @function
   * @memberof Chat
   */

  componentWillUnmount = () => {
    this.props.setView(undefined);
    clearInterval(this.interval);
  };

  sendFileWithImage = (data, callback) => {
    const { userData, navigation } = this.props;
    const toUID = navigation.state.params.uid;
    const sendObject = {
      fromUID: userData.peerID,
      toUID,
      msg: {
        text: ''
      },
      timestamp: new Date().getTime(),
      type: messageType.MESSAGE
    };
    data.images.forEach(async (image, key) => {
      const id = bitcoin.sha256(
        `${userData.peerID} + ${toUID}  +  ${sendObject.msg.text
        + sendObject.msg.file}  + ${new Date().getTime()}`
      );
      if (data.position === key) {
        const sendData = { ...sendObject };

        sendData.msg = {
          text: data.message,
          typeFile: 'image'
        };

        this.props.sendMessageWithFile(
          { ...sendData, msgID: id },
          image.url,
          image.base64
        );
      } else {
        const sendData = { ...sendObject };
        sendData.msg.text = '';
        sendData.msg.file = image.base64;
        sendData.msg.typeFile = 'image';
        this.props.sendMessageWithFile(
          { ...sendData, msgID: id },
          image.url,
          image.base64
        );
      }

      if (data.images.length === key + 1) {
        callback();
        this.closeFileModal();
      }
    });
  };

  closeView = () => {
    this.setState({ imagesView: [] });
  };

  render() {
    const { navigation, screenProps } = this.props;
    const viewImages = this.state.imagesView.length !== 0;
    const chatSelected = this.props.chat[this.props.chatSelected.index];

    const messages = Object.values(chatSelected.messages).length
      ? Object.values(chatSelected.messages).sort((
        a, b
      ) => new Date(b.timestamp) - new Date(a.timestamp))
      : [];
    return (
      <Container>
        {viewImages && (
          <ImagesView
            open={viewImages}
            images={this.state.imagesView}
            close={this.closeView}
            screenProps={screenProps}
          />
        )}
        <Header
          isConnected={this.state.isConnected}
          seconds={this.state.seconds}
          {...this.props}
          menu={this.state.menu}
          selected={this.state.selected}
          back={this.back}
          copy={this.copy}
          delete={this.delete}
        />
        <ChatContainer behavior="padding" style={{ flex: 1 }}>
          <ChatBody
            chats={messages}
            user={this.props.userData}
            contacts={this.props.contact}
            onClick={this.onClick}
            onSelected={this.onSelected}
            selected={this.state.selected}
            close={this.closeFileModal}
            open={this.state.fileModal}
            sendFileWithImage={this.sendFileWithImage}
            sendReadMessageStatus={this.props.sendReadMessageStatus}
            sendAgain={this.props.sendAgain}
            screenProps={screenProps}
          />
          <ChatForm
            user={this.props.userData}
            navigation={navigation.state}
            setChat={this.props.initialChat}
            previousChat={this.props.chatSelected}
            openFileModal={this.openFileModal}
            sendMessagesWithSound={this.props.sendMessageWithFile}
            screenProps={screenProps}
          />
        </ChatContainer>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  userData: state.config,
  chat: state.chats.chat,
  chatSelected: state.chats.seletedChat,
  contact: Object.values(state.contacts.contacts)
});

export default connect(mapStateToProps, {
  initialChat,
  setView,
  cleanAllChat,
  sendMessageWithFile,
  deleteMessages,
  sendReadMessageStatus,
  sendAgain,
  verifyImage,
  setNewDials
})(Chat);

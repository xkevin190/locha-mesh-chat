import '../../../__Mocks__';
import React from 'react';
import { shallow } from 'enzyme';
import { navigationPops } from '../../components/heder-test';
import AdministrativeComponent from '../../../src/views/config/AdministrativeComponent';
import store from '../../../src/store';


const screenProps = {
  t: (data) => data
};

const mockStartServer = jest.fn((callback) => callback());
const mockStopServer = jest.fn((callback) => callback());
const mockShowPanel = jest.fn((callback) => callback());
const hiddePanel = jest.fn((callback) => callback());
const mocksendDial = jest.fn((adress, callback) => callback(true));
const mocksendDialfalse = jest.fn((adress, callback) => callback(false));

describe('test Administrative component', () => {
  const wrapper = shallow(
    <AdministrativeComponent
      store={store}
      screenProps={screenProps}
      navigation={navigationPops}
    />
  ).childAt(0).dive();


  test('simulate start manual service', async () => {
    wrapper.setProps({
      startManualService: mockStartServer
    });

    wrapper.find('Styled(Switch)').at(0).props().onTouchEnd();

    expect(mockStartServer.mock.calls.length).toBe(1);
  });

  test('simulate stop service', () => {
    wrapper.setProps({
      stopService: mockStopServer,
      chatService: true
    });

    wrapper.find('Styled(Switch)').at(0).props().onTouchEnd();
    expect(mockStopServer.mock.calls.length).toBe(1);
  });

  test('simulate button dial', () => {
    wrapper.find('Styled(ListItem)').at(3).props().onPress();

    expect(wrapper.instance().state.dialAddress).toBe(true);
  });

  test('simulate button dial', () => {
    wrapper.find('Styled(ListItem)').at(3).props().onPress();

    expect(wrapper.instance().state.dialAddress).toBe(true);
  });


  test('simulate button address listen', () => {
    wrapper.find('Styled(ListItem)').at(6).props().onPress();

    expect(wrapper.instance().state.addresListen).toBe(true);
  });

  test('panel show button simulation', () => {
    wrapper.setProps({
      openAdministrativePanel: mockShowPanel,
      administrative: false
    });
    wrapper.find('Styled(Switch)').at(2).props().onTouchEnd();
    expect(mockShowPanel.mock.calls.length).toBe(1);
  });

  test('panel hide button simulation', () => {
    wrapper.setProps({
      closeAdministrativePanel: hiddePanel,
      administrative: true
    });
    wrapper.find('Styled(Switch)').at(2).props().onTouchEnd();
    expect(hiddePanel.mock.calls.length).toBe(1);
  });

  test('close modal dials', () => {
    wrapper.instance().setState({ dialAddress: true });
    wrapper.instance().closeModal('dialAddress');
    expect(wrapper.instance().state.dialAddress).toBe(false);
  });


  test('close add new bootstrap modal', () => {
    wrapper.instance().setState({ manualBootstrap: true });
    wrapper.instance().closeModal('bootstrapAddress');
    expect(wrapper.instance().state.manualBootstrap).toBe(false);
  });

  test('close new adress listen modal', () => {
    wrapper.instance().setState({ addresListen: true });
    wrapper.instance().closeModal();
    expect(wrapper.instance().state.addresListen).toBe(false);
  });

  test('simulate sendDialToChatService', () => {
    wrapper.setProps({
      setNewDials: mocksendDial,
    });
    wrapper.instance().sendDialToChatService('test', () => { });
    expect(mocksendDial.mock.calls.length).toBe(1);
  });

  test('simulate sendDialToChatService when callback response false', () => {
    wrapper.setProps({
      setNewDials: mocksendDialfalse,
    });
    wrapper.instance().sendDialToChatService('test', () => { });
    expect(mocksendDialfalse.mock.calls.length).toBe(1);
  });
});

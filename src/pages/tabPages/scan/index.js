import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Alert,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from '../../../utils/Constants';

import BarcodeScan from './BarcodeScan';
import RestAPI from '../../../utils/RestAPI';
class Index extends React.Component {

  scanner = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };

    this.viewRef = React.createRef();

  }

  componentDidMount() {
    const { navigation } = this.props
    this._focus = navigation.addListener('focus', () => {
      StatusBar.setHidden(true)
    })
    this._blur = navigation.addListener('blur', () => {
      StatusBar.setHidden(false)
    })
  }



  componentWillUnmount() {
  }

  onScannedDetails = (asin) => {
    const { navigation } = this.props;

    showPageLoader(true)

    const data = {
      api_version: 1,
      user_id: global.curUser.id,
      param: asin,
    };
    this.setState({ isLoading: true });
    RestAPI.generalPost('app/item_search', data)
      .then((res) => {
        showPageLoader(false)
        this.setState({ isLoading: false });

        if (Array.isArray(res)) {
          if (res.length > 1) {
            navigation.navigate('search', { data: res, keyword: asin });
          } else if (res.length == 1) {
            navigation.navigate('item_detail', { data: { asin: res[0].asin } });
          } else {
            Alert.alert('No results', 'There is no search results relatd to ' + asin)
            this.scanner.current.setCaptured(false)
          }
        }

      })
      .catch((err) => {
        showPageLoader(false)
        this.setState({ isLoading: false });
        Alert.alert('Failed', 'Somethings are wrong in request.' + err.message);
        this.scanner.current.setCaptured(false)
      });

  };

  render() {
    
    return (

      <View style={styles.container}>
        <View style={{ flex: 1, width: Constants.WINDOW_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
          <BarcodeScan
            ref={this.scanner}
            onBarCodeRead={(val) => {
              this.onScannedDetails(val)
            }} />
        </View>
      </View>
    );
  }
}

export default function () {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const curRole = useSelector((state) => state.role.curRole);

  return (
    <Index
      navigation={navigation}
      route={route}
      dispatch={dispatch}
      curRole={curRole}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0, borderColor: 'red',
    width: Constants.WINDOW_WIDTH,
    height: Constants.WINDOW_HEIGHT,
    flex: 1,
    backgroundColor: Constants.backColor,

    alignItems: 'stretch',
  },
});

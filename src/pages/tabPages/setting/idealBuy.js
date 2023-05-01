import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';

import { useDispatch, useSelector} from 'react-redux';
import { updateSetting} from '../../../store/actions';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';
import Constants from '../../../utils/Constants';
import Utils from '../../../utils/Utils';

import RestAPI from '../../../utils/RestAPI';
import {
  FillButton,
} from '../../../components/Buttons';

import HeaderBar from '../../../components/HeaderBar';

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      showKeepDaysPicker: false,
    };
  }

  componentDidMount() {
    const {navigation, route} = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      let settingData = route.params?.data;
      this.setState({data: settingData});
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateSetting = () => {
    
    const { navigation, dispatch} = this.props;
    let setting = {...this.state.data};
    if (setting.use_ideal_buy == 0) {
      setting.great_rank_only = 0;
      setting.amz_is_not_merchnat = 0;
    }

    const data = {
      api_version: 1,
      user_id: global.curUser.id,

      inc_font_size: setting.inc_font_size,
      keep_history: setting.keep_history,
      check_restrictions: setting.check_restrictions,
      desired_roi: setting.desired_roi,
      use_ideal_buy: setting.use_ideal_buy,
      amz_is_not_merchnat: setting.amz_is_not_merchnat,
      great_rank_only: setting.great_rank_only,
      shipping_rate: setting.shipping_rate,
      sales_tax: setting.sales_tax,
    };

    showPageLoader(true);
    RestAPI.generalPost('app/update_settings', data)
      .then((res) => {
        showPageLoader(false);
        if (res?.status == 1) {

          dispatch(updateSetting(data))

          navigation.goBack();
        } else {
          Alert.alert('Failed to update setting information', '');
        }
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert('Failed', err.message);
      });
  };

  toggleUseIdealBuy = (val) => {
    const newData = {
      ...this.state.data,
      use_ideal_buy: !val ? 0 : 1,
    };
    this.setState({
      data: newData,
    });
  };

  onIdealBuy = () => {
    const {navigation} = this.props;
    navigation.navigate('ideal_buy_detail');
  };

  onAmzIsNotMerchant = () => {
    let settingData = this.state.data;
    let use_ideal_buy = Utils.strToInt(settingData?.use_ideal_buy, 0);

    let amz_is_not_merchnat = Utils.strToInt(
      settingData?.amz_is_not_merchnat,
      0,
    );

    let newVal = use_ideal_buy == 0 ? 0 : amz_is_not_merchnat == 1 ? 0 : 1;

    this.setState({
      data: {
        ...this.state.data,
        amz_is_not_merchnat: newVal,
      },
    });
  };

  onGreatRankOnly = () => {
    let settingData = this.state.data;

    let use_ideal_buy = Utils.strToInt(settingData?.use_ideal_buy, 0);

    let great_rank_only = Utils.strToInt(settingData?.great_rank_only, 0);

    let newVal = use_ideal_buy == 0 ? 0 : great_rank_only == 1 ? 0 : 1;

    this.setState({
      data: {
        ...this.state.data,
        great_rank_only: newVal,
      },
    });
  };

  onSave = () => {
    this.updateSetting();
  };

  render() {
    const {navigation} = this.props;

    let settingData = this.state.data;

    let use_ideal_buy = Utils.strToInt(settingData?.use_ideal_buy, 0);

    let amz_is_not_merchnat = Utils.strToInt(
      settingData?.amz_is_not_merchnat,
      0,
    );
    let great_rank_only = Utils.strToInt(settingData?.great_rank_only, 0);

    if (use_ideal_buy == 0) {
      amz_is_not_merchnat = 0;
      great_rank_only = 0;
    }

    return (
      <View style={styles.container}>
        <HeaderBar
          title={'Ideal Buy'}
          isShowRight={false}
          isBackLeft={true}
          isShowLeft={true}
          leftIconColor={Constants.green}
          onLeftButton={() => {
            navigation.goBack();
          }}
        />
        <View style={styles.rowTop}>
          <View style={{width: 40, height: 60}}>
            <Image
              source={require('../../../../assets/tag.png')}
              resizeMode={'cover'}
              style={{width: 40, height: 56}}
            />
            <View style={{position: 'absolute', top: 5, left: 5}}>
              <Feather name="thumbs-up" color={Constants.white} size={30} />
            </View>
          </View>

          <Text
            style={{color: Constants.white, fontSize: 15, textAlign: 'center'}}>
            Ideal Buy allows you to create a formula for your perfect purchase.
            If we notice any items in your searches that match your formula,
            we'll flag them for you!
          </Text>
          <View
            style={{
              flexDirection: 'row',
              height: 50,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: Constants.green,
                fontSize: 18,
                marginTop: 10,
                marginRight: 10,
              }}>
              Use Ideal Buy
            </Text>
            <Switch
              trackColor={{
                false: Constants.grayColor,
                true: Constants.lightGreen,
              }}
              thumbColor={
                use_ideal_buy == 1 ? Constants.green : Constants.white
              }
              ios_backgroundColor={Constants.white}
              onValueChange={(val) => {
                this.toggleUseIdealBuy(val);
              }}
              value={use_ideal_buy == 1}
            />
          </View>
        </View>

        <View
          style={{
            backgroundColor: Constants.white,
            marginTop: 10,
            padding: 10,
            width: Constants.WINDOW_WIDTH * 0.95,
            borderRadius: 5,
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 5,
            }}
            onPress={this.onAmzIsNotMerchant}>
            <Feather
              name={amz_is_not_merchnat == 1 ? 'check-square' : 'square'}
              size={20}
              color={
                amz_is_not_merchnat == 1 ? Constants.green : Constants.grayColor
              }
            />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 15,
                color: Constants.primaryColor,
              }}>
              {' '}
              Amazon is Not The Merchant
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 5,
            }}
            onPress={this.onGreatRankOnly}>
            <Feather
              name={great_rank_only == 1 ? 'check-square' : 'square'}
              size={20}
              color={
                great_rank_only == 1 ? Constants.green : Constants.grayColor
              }
            />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 15,
                color: Constants.primaryColor,
              }}>
              {' '}
              "Great" Rank Only
            </Text>
          </TouchableOpacity>
        </View>

        <FillButton
          title={'Save Changes'}
          onPress={this.onSave}
          style={{marginTop: 20, width: Constants.WINDOW_WIDTH * 0.95}}
        />
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
    flex: 1,
    backgroundColor: Constants.backColor,
    alignItems: 'center',
  },
  rowTop: {
    marginTop: 60,

    paddingTop: 0,
    paddingBottom: 40,
    width: Constants.WINDOW_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Constants.secondaryColor,
  },
  row: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  rowMain: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Constants.white,
    marginVertical: 2,
  },
});

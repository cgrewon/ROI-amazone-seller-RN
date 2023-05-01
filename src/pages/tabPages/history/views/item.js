import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import {useSelector} from 'react-redux';

import Constants from '../../../../utils/Constants';
import Utils from '../../../../utils/Utils';
import Feather from 'react-native-vector-icons/Feather';

export default Item = ({item, onTapItem}) => {

  const curRole = useSelector((state) => state.role.curRole);
  const setting = useSelector((state) => state.setting.settingData);

  let image = item?.image ?? null;

  console.log('setting data in history item:', setting, ',  curRole:', curRole)
  

  image = "https://m.media-amazon.com/images/I/"+image+"._SL160_.jpg"

  let DisplayValue = item?.title ?? '--';
  let asin = item?.asin ?? '--';
  let rank = Utils.strToInt(item?.rank, 0);
  let total = Utils.strToInt(item?.total, 0);
  let category = item?.category ?? '--';
  let top = Utils.strToInt(item?.top, 0);
  let offers = item?.offers ?? '--';
  let created = Utils.strToInt(item?.created, 0);
  let is_amazon = Utils.strToInt(item?.is_amazon, 0);

  total = isNaN(total) ? '--' : total

  let isShowTag = total == 0  ? false : (rank * 100) / total > top;

  if(setting.use_ideal_buy == 1){
   
    isShowTag = setting.amz_is_not_merchnat == 1 ? isShowTag && (is_amazon == 0) : isShowTag
   
    isShowTag =  setting.great_rank_only == 1 ? isShowTag && (top < 1 ) : isShowTag;

  }else{
    isShowTag = false;
  }


  

  return (
    <View style={styles.itemContainer}>
      <Image
        source={
          image ? {uri: image} : require('../../../../../assets/default.jpg')
        }
        resizeMode={'cover'}
        style={{
          width: Constants.WINDOW_WIDTH * 0.25,
          height: Constants.WINDOW_WIDTH * 0.25,
          borderRadius: 5,
        }}
      />
      <TouchableOpacity style={styles.contentItem} onPress={onTapItem}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {DisplayValue}
        </Text>
        <Text style={styles.item2ndTitle} numberOfLines={1}>
          {asin + ' '}|{' ' + offers + ' '}Offers
        </Text>
        <Text style={styles.itemLastDetail} numberOfLines={1}>
          {rank + ' '}| {total}{' '}
          <Text style={styles.itemLastDetailSecondary}>
            {' '}
            in {' ' + category}
          </Text>
        </Text>
      </TouchableOpacity>
      {isShowTag && (
        <View style={{position: 'absolute', top: -4, left: 10}}>
          <Image
            source={require('../../../../../assets/tag.png')}
            resizeMode={'contain'}
            style={{width: 30, height: 45}}
          />
          <View style={{position: 'absolute', top: 8, left: 5}}>
            <Feather name="thumbs-up" size={20} color={Constants.white} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.backColor,

    alignItems: 'stretch',
  },
  mainContainer: {paddingTop: 10, flex: 1, paddingHorizontal: 5},
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: Constants.white,
    marginVertical: 5,
    borderRadius: 10,
    elevation:5,
    marginHorizontal: 10,
    marginVertical:6,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowColor: Constants.opacityBlack
  },
  contentItem: {
    flex: 1,
    paddingLeft: 6,
  },
  itemTitle: {
    fontSize: 16,
    color: Constants.primaryColor,
  },
  item2ndTitle: {
    fontSize: 14,
    color: Constants.secondaryColor,
  },
  itemLastDetail: {
    fontSize: 14,
    color: Constants.green,
  },
  itemLastDetailSecondary: {
    fontSize: 14,
    color: Constants.secondaryColor,
  },
});

import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  Linking,
  Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import AutoHeightWebView from "react-native-autoheight-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "../../../utils/Constants";
import Utils from "../../../utils/Utils";
import RestAPI, {
  FBACategories,
  JungleScoutCategories,
} from "../../../utils/RestAPI";
import ActionSheet from "../../../components/ActionSheet";
import JungleEstimator from "../../../components/JungleEstimator";
import { PulseIndicator } from "react-native-indicators";

import { FillButton } from "../../../components/Buttons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import { InputOutLine } from "../../../components/Inputs";
import SegViews from "../../../components/SegView";

import Divider from "../../../components/Divider";

import ProfitaView from "./views/ProfitaView";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this._isHistory = false;
    this.state = {
      searchText: "",
      isLoading: false,

      curSegIndex: 0,
      offersData: null,
      asin: null,
      showResearchAction: false,

      showKeepa: false,
      keepaData: "",
      feeDetails: null,
      selPrice: null,

      net: 0,
      roi: 0,
      total: 0,
      restrictionLabel: null,
      hazmatLabel: null,

      checkingLabel: false,
      isJungleCheck: false,

      showEditModal: false,
    };

    this._expensesCost = null;
  }

  componentDidMount() {
    const { route, navigation } = this.props;

    this._focus = navigation.addListener("focus", () => {
      StatusBar.setBarStyle("dark-content");
      if (Platform.OS == "android") {
        StatusBar.setBackgroundColor(Constants.transparent);
        StatusBar.setTranslucent(true);
      }

      this.loadData(asin);
    });

    this._blur = navigation.addListener("blur", () => {
      StatusBar.setBarStyle("dark-content");
      if (Platform.OS == "android") {
        StatusBar.setBackgroundColor(Constants.white);
        StatusBar.setTranslucent(false);
      }
    });

    const data = { ...route.params.data };
    this._isHistory = route.params.isHistory ?? false;

    let asin = data?.asin ?? "--";

    this.setState({ asin: asin });
  }

  componentWillUnmount() {
    if (this._focus) {
      this._focus();
    }
    if (this._blur) {
      this._blur();
    }
  }

  calcTotalNetROI = (expenses, productInfo) => {
    const {
      cost,
      referal,
      fulfillment,
      closing,
      shipping,
      storage,
      prep_cost,
    } = expenses;

    const price = productInfo?.price ?? 0;

    let priceVal = parseFloat(price);
    priceVal = isNaN(priceVal) ? 0 : priceVal;
    priceVal = Math.round(priceVal * 100) / 100;

    let realCost = this._expensesCost ?? 0;
    let taxIncurred = (this.props.setting?.sales_tax / 100) * realCost;
    let vals = [
      parseFloat(realCost),
      parseFloat(taxIncurred),
      parseFloat(referal),
      parseFloat(fulfillment),
      parseFloat(closing),
      parseFloat(shipping),
      parseFloat(storage),
      parseFloat(prep_cost),
    ];

    vals = vals.map((one) => (isNaN(one) ? 0 : one));

    let total = 0;
    for (let one of vals) {
      total += one;
    }

    total = Math.round(total * 100) / 100;
    console.log(
      "realCost :",
      realCost,
      " this._expensesCost : ",
      this._expensesCost,
      " >>> vals:",
      vals
    );
    console.log("Detail > expenses : ", JSON.stringify(expenses, null, 2));
    console.log(
      "Detail > offersData > productInfo : ",
      JSON.stringify(productInfo, null, 2)
    );
    const listPrice = this.state.selPrice ?? productInfo?.price ?? 0;
    // TODO:  net profit  = list price - total expenses

    let net = listPrice - total;
    net = Math.round(net * 100) / 100;

    let roi = realCost == 0 ? 0 : (net * 100) / realCost;

    roi = Math.round(roi * 100) / 100;

    console.log(
      "Detail > net = listPrice - total:",
      net,
      "=",
      listPrice,
      "-",
      total,
      " roi: ",
      roi,
      " :cost: ",
      cost
    );

    this.setState({
      net: net,
      roi: roi,
      total: total,
    });

    return {
      net,
      total,
      roi,
    };
  };

  loadData = (asin) => {
    const data = {
      api_version: 1,
      user_id: global.curUser.id,
      asin: asin,
      history: this._isHistory ? 1 : 0,
    };

    showPageLoader(true);
    RestAPI.generalPost("app/get_price_offers", data)
      .then((res) => {
        showPageLoader(false);

        if (!res || !res.productInfo) {
          Alert.alert("No result", "There is no search result.");
        }

        this.calcTotalNetROI(res.expenses, res.productInfo);
        this.setState({ offersData: res, feeDetails: null });
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert("Failed", err.message);
      });

    RestAPI.getSellerCentralResult(asin, {})
      .then((res) => {
        const processRes = RestAPI.processAws(asin, res);
        const label = RestAPI.getAwsRestrictionLabel(processRes.result);
        this.setState({ restrictionLabel: label });
      })
      .catch((err) => {
        this.props.navigation.navigate("sellerwebview", { asin: asin });
      });
  };

  loadExpensesData = (price = 0) => {
    const data = {
      api_version: 1,
      user_id: global.curUser.id,
      asin: this.state.asin,
      price: price,
    };

    showPageLoader(true);
    RestAPI.generalPost("app/get_fees_details", data)
      .then((res) => {
        showPageLoader(false);

        let expenses = { ...res };
        expenses.cost = this._expensesCost ?? price;

        this.calcTotalNetROI(
          expenses,
          this.state.offersData.productInfo ?? { price: 0 }
        );
        this.setState({ feeDetails: res });
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert("Failed", err.message);
      });
  };

  onTapDetails = (item) => {
    const { navigation, route } = this.props;
    navigation.navigate("job_detail", { item: item });
  };

  onCleanSearch = () => {
    this.setState({ data: [], searchText: "" });
  };

  onResearch = () => {};

  onAdd = () => {};

  onShare = async () => {
    let msg =
      "ASIN: " +
      this.state.asin +
      " https://www.amazon.com/gp/product/" +
      this.state.asin;

    try {
      const result = await Share.share({
        message: msg,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  onTapKeepa = async () => {
    const data = {
      api_version: 1,
      user_id: global.curUser.id,
      asin: this.state.asin,
    };

    let query =
      "?api_version=1&user_id=" +
      global.curUser.id +
      "&asin=" +
      this.state.asin +
      "&platform=" +
      Platform.OS;

    showPageLoader(true);
    RestAPI.generalGet("app/keepa_graph" + query, false)
      .then((res) => {
        showPageLoader(false);
        this.setState({ keepaData: res, showKeepa: true });
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert("Failed", err.message);
      });
  };

  openJungleScout = (category, rank) => {
    const { navigation } = this.props;
    const title = "Jungle Estimator";

    const link = "https://junglescout.com/estimator";

    navigation.navigate("junglescoutpage", { title, link, category, rank });
  };
  onTapSalesEstimator = () => {
    let data = this.state.offersData.productInfo;

    if (!data.category) {
      Alert.alert(
        "Validation Error",
        "Category of this product is invalid. : " + data.category
      );
      return;
    }

    if (!data.rank) {
      Alert.alert(
        "Validation Error",
        "Rank of this product is invalid. : " + data.rank
      );
    }
    const fbaCategoriesParsed = FBACategories.map((one) => {
      return one.replace(/\s/g, "").toLowerCase();
    });
    const cate = data?.category.replace(/\s/g, "").toLowerCase();

    const jungleCategorized = JungleScoutCategories.map((one) => {
      return one.replace(/\s/g, "").toLowerCase();
    });

    if (fbaCategoriesParsed.includes(cate)) {
      showPageLoader(
        true,
        "Loading from FBA, category:" +
          this.state.offersData.productInfo?.category +
          ", rank: " +
          this.state.offersData.productInfo?.rank
      );
      RestAPI.get_estimated_sales(this.state.offersData.productInfo)
        .then((res) => {
          showPageLoader(false);

          Alert.alert("Estimated Sales", "" + res.sales);
        })
        .catch((ex) => {
          showPageLoader(false);
          console.log(ex);
          Alert.alert("Failed", ex);
        });
    } else if (jungleCategorized.includes(cate)) {
      showPageLoader(
        true,
        "Loading from jungle, category:" +
          this.state.offersData.productInfo?.category +
          ", rank: " +
          this.state.offersData.productInfo?.rank
      );
      this.setState({ isJungleCheck: true });
    } else {
      Alert.alert(
        'Unknown Category "' + data?.category + '"',
        "This category is not supported, we will add new category in next version."
      );
    }
  };

  onTapResearchItem = async (item, index) => {
    if (!this.state.asin) {
      Alert.alert(
        "Error",
        "Asin is not valid, please back and select item again."
      );
      return;
    }
    const productInfo = this.state.offersData?.productInfo ?? null;

    let itemTitle = productInfo?.title ?? "Unknown";

    let url = "";
    if (index == 0) {
      url = "https://www.amazon.com/gp/product/" + this.state.asin;
    } else if (index == 1) {
      url =
        "https://sellercentral.amazon.com/productsearch/search?query=" +
        this.state.asin;
    }

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Alert", `Don't know how to open this URL: ${url}`);
    }
  };

  onTapCheckRestrictionLabel = () => {
    const { navigation } = this.props;
    const asin = this.state.asin;

    try {
      if (!this.state.restrictionLabel) {
        Alert.alert(
          "ROI Scanner",
          "You must signin Amazon Seller Central to check restrictions",
          [
            {
              text: "Ok",
              style: "default",
              onPress: () => {
                navigation.navigate("sellerwebview", { asin: asin });
              },
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {},
            },
          ]
        );
      } else {
        if (this.state.restrictionLabel == "Req Apr?") {
          // TODO in app approval //  https://sellercentral.amazon.com/productsearch?q={asin}

          const title = "Product Approval";

          const link = `https://sellercentral.amazon.com/productsearch?q=${asin}`;

          const injectJS = `           

            function converter(){
              setTimeout(()=>{
                for(var one of document.getElementsByTagName('a')){
                  one.setAttribute('target', '_self');
                }
                // var content = ''

                let counter = 0;
                for(var one of document.getElementsByTagName('a')){
                  if(one.innerHTML.indexOf('Apply to sell') != -1){
                    let link = one.getAttribute('href')

                    one.setAttribute('href', 'javascript:void(0);');
                    one.setAttribute('onclick' , 'javascript: window.location.href="'+link + '"')
                    const cont = one.getAttribute('href')
                    const onClickCont = one.getAttribute('onclick')

                    window.ReactNativeWebView.postMessage(cont);
                    window.ReactNativeWebView.postMessage(onClickCont);
                    counter = 1;
                  }
                  
                }

                if(counter == 0){
                  converter()
                }             

              }, 1000)
            }

            converter()

              `;

          navigation.navigate("webpage", { title, link, asin, injectJS });
        }
      }
    } catch (ex) {
      console.error("exception @ tap restriction label: ", ex);
      Alert.alert("Error", ex.message);
    }
  };

  render() {
    const { navigation, setting } = this.props;

    const productInfo = this.state.offersData?.productInfo ?? null;

    let image = productInfo?.image;
    image = "https://m.media-amazon.com/images/I/" + image + ".jpg";

    let itemTitle = productInfo?.title ?? "Unknown";
    const asin = productInfo?.asin;

    let OfferCount = productInfo?.offers ?? 0;

    let rank = productInfo?.rank ?? "--";
    let category = productInfo?.category ?? "--";

    let total = "--";

    rank = productInfo?.rank;
    category = productInfo?.category ?? "--";
    total = productInfo?.total;

    let dimensions = "---";

    try {
      let dict = JSON.parse(productInfo?.dimensions);

      dimensions =
        "height: " +
        dict.height +
        '" ,  width: ' +
        dict.width +
        '" ,  length: ' +
        dict.length +
        '"';
    } catch (ex) {}

    let targetCostUnit = this.state.offersData?.expenses?.cost ?? 0;

    let weight = productInfo?.weight ?? "--";
    let sizeTier = productInfo?.sizeTier ?? "--";
    const fba = this.state.offersData?.offers?.FBA ?? [];
    const news = this.state.offersData?.offers?.New ?? [];
    const used = this.state.offersData?.offers?.Used ?? [];

    let expenses = this.state.feeDetails ?? this.state.offersData?.expenses;
    expenses = expenses == null ? {} : expenses;
    const ipAlert = this.state.offersData?.ipalert == 1 ? true : false;

    let restrictionBackColor = "#DB3351";

    if (this.state.hazmatLabel) {
      restrictionBackColor = "#DB3351";
    } else if (this.state.restrictionLabel == "Req Apr?") {
      restrictionBackColor = "#DB3351";
    } else if (this.state.restrictionLabel == "Sell-New?") {
      restrictionBackColor = Constants.green;
    }

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={"dark-content"}
          backgroundColor={Constants.transparent}
          translucent={true}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <View style={styles.mainContainer}>
            <TouchableOpacity
              onPress={async () => {
                let url = "https://www.amazon.com/dp/" + this.state.asin;
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert(
                    "Alert",
                    `Don't know how to open this URL: ${url}`
                  );
                }
              }}
            >
              <Image
                source={
                  image
                    ? { uri: image }
                    : require("../../../../assets/default.jpg")
                }
                resizeMode={"cover"}
                style={{
                  backgroundColor: Constants.white,
                  width: Constants.WINDOW_WIDTH,
                  height: Constants.WINDOW_WIDTH * 0.8,
                }}
              />
            </TouchableOpacity>

            {setting.check_restrictions == 1 && (
              <TouchableOpacity
                style={{
                  flex: 0,
                  paddingHorizontal: 10,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: restrictionBackColor,
                  position: "absolute",
                  left: 10,
                  top: Constants.WINDOW_WIDTH * 0.8 - 50,
                  zIndex: 100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={this.onTapCheckRestrictionLabel}
              >
                {this.state.checkingLabel ? (
                  <PulseIndicator color={"white"} size={15} />
                ) : (
                  <Text style={{ color: Constants.white, fontSize: 15 }}>
                    {this.state.restrictionLabel ?? "Check Restrictions"}
                    {this.state.hazmatLabel ? this.state.hazmatLabel : ""}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {ipAlert && (
              <TouchableOpacity
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: Constants.googleColor,
                  position: "absolute",
                  right: 10,
                  top: Constants.WINDOW_WIDTH * 0.8 - 50,
                  zIndex: 100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  Alert.alert(
                    "WARNING",
                    "This Brand has a history of filing IP Complaints to Amazon from Sellers in their listings, proceed with caution and take that into account if you decide to source this product."
                  );
                }}
              >
                <Feather name="alert-triangle" size={15} color={"yellow"} />
              </TouchableOpacity>
            )}

            <View style={styles.topContainer}>
              <View style={styles.rowTop}>
                <View style={{ marginLeft: 0, flex: 1, padding: 3 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      color: Constants.primaryColor,
                      textAlign: "center",
                    }}
                  >
                    {itemTitle}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: "100%",
                  padding: 5,
                  backgroundColor: Constants.white,
                  alignItems: "center",
                  borderRadius: 5,
                  marginTop: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: Constants.primaryColor,
                    textAlign: "center",
                  }}
                >
                  {asin} Target Cost/Unit: {targetCostUnit >= 0 ? "" : "-"}$
                  {Math.abs(targetCostUnit)}
                </Text>
                <Text
                  style={{
                    color: Constants.secondaryColor,
                    fontSize: 14,

                    textAlign: "center",
                  }}
                >
                  <Text
                    style={{
                      color: Constants.green,
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    Top {Utils.getFormatFloat((rank * 100) / total)}% of {total}{" "}
                    {"  "}
                  </Text>
                  in {category} {sizeTier} {weight}lbs
                </Text>
                <Text
                  style={{
                    color: Constants.secondaryColor,
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {dimensions}
                </Text>
                <Divider
                  color={Constants.lightGreen}
                  style={{ marginVertical: 3 }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: Constants.lightBlue, fontSize: 14 }}>
                    Channel:{" "}
                  </Text>
                  <Text style={{ fontSize: 14, color: Constants.lightBlue }}>
                    FBA
                  </Text>
                  <Text
                    style={{
                      color: Constants.lightBlue,
                      fontSize: 14,
                      paddingLeft: 15,
                    }}
                  >
                    Cost/Unit:
                  </Text>
                  <Text style={{ fontSize: 14, color: Constants.lightBlue }}>
                    ${this._expensesCost ?? "0.00"}
                  </Text>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => {
                      this.setState({ showEditModal: true });
                    }}
                  >
                    <Text
                      style={{
                        color: Constants.lightBlue,
                        fontSize: 14,
                        paddingLeft: 15,
                      }}
                    >
                      List Price:
                    </Text>
                    <Text style={{ fontSize: 14, color: Constants.lightBlue }}>
                      $
                      {this.state.selPrice ??
                        this.state.offersData?.productInfo?.price ??
                        "0.00"}
                    </Text>
                    <Feather name="edit-2" size={15} color={Constants.green} />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: Constants.primaryColor, fontSize: 14 }}>
                    Net Profit:{" "}
                  </Text>
                  <Text style={{ fontSize: 14 }}>
                    {this.state.net < 0 ? "-" : ""}${Math.abs(this.state.net)}
                  </Text>
                  <Text
                    style={{
                      color: Constants.primaryColor,
                      fontSize: 14,
                      paddingLeft: 15,
                    }}
                  >
                    ROI:{" "}
                  </Text>
                  <Text style={{ fontSize: 14 }}>{this.state.roi}%</Text>
                </View>
              </View>
            </View>
            <View
              style={{
                backgroundColor: Constants.white,
                flexDirection: "row",
                paddingVertical: 3,
              }}
            >
              <SegViews
                curIndex={this.state.curSegIndex}
                titleList={[OfferCount + " OFFERS", "PROFIT CALC"]}
                onTapItem={(one, index) => {
                  this.setState({ curSegIndex: index, showKeepa: false });
                }}
              />
            </View>

            {this.state.showKeepa && (
              <AutoHeightWebView
                style={{
                  width: Constants.WINDOW_WIDTH - 20,
                  marginTop: 20,
                  marginLeft: 10,
                }}
                files={[
                  {
                    href: "cssfileaddress",
                    type: "text/css",
                    rel: "stylesheet",
                  },
                ]}
                source={{
                  html: this.state.keepaData,
                }}
                scalesPageToFit={true}
                onLoadStart={() => {
                  showPageLoader(true);
                }}
                onLoadEnd={(event) => {
                  showPageLoader(false);
                }}
              />
            )}

            {this.state.curSegIndex == 0 && this.state.showKeepa == false && (
              <OffersView
                fbaList={fba ?? []}
                newList={news ?? []}
                usedList={used ?? []}
                onTapCost={(selPrice) => {
                  this.loadExpensesData(selPrice);
                  this.setState({ curSegIndex: 1, selPrice: selPrice });
                }}
              />
            )}
            {this.state.curSegIndex == 1 && this.state.showKeepa == false && (
              <ProfitaView
                expenses={expenses}
                selPrice={this._expensesCost} // * ?? this.state.selPrice
                listPrice={
                  this.state.selPrice ??
                  this.state.offersData?.productInfo?.price ??
                  0
                }
                onChangedCost={(newExpenses, oldListPrice) => {
                  this._expensesCost = newExpenses.cost;

                  this.calcTotalNetROI(newExpenses, { price: oldListPrice });
                }}
              />
            )}
          </View>
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 10,
            backgroundColor: Constants.white,
            paddingHorizontal: 10,
            borderTopWidth: 1,
            borderTopColor: Constants.greyWhite,
            flex: 0,
            shadowOffset: {
              width: 0,
              height: -5,
            },
            elevation: 3,
            shadowOpacity: 0.5,
          }}
        >
          <FillButton
            icon={
              <Feather name="bar-chart" size={20} color={Constants.white} />
            }
            title={"Keepa"}
            style={{
              flex: 1,
              marginRight: 10,
              backgroundColor: Constants.orange,
            }}
            onPress={this.onTapKeepa}
          />
          <FillButton
            icon={
              <FontAwesome name="flask" size={20} color={Constants.white} />
            }
            title={"Sales Estimator"}
            style={{ flex: 1 }}
            onPress={this.onTapSalesEstimator}
          />
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
          }}
        >
          {setting.check_restrictions == 1 && (
            <WebView
              style={{
                height: 1,
                width: 1,
              }}
              androidHardwareAccelerationDisabled={true}
              source={{
                uri:
                  "https://sellercentral.amazon.com/hz/m/sourcing/inbound/eligibility?ref_=ag_src-elig_cont_src-mdp&asin=" +
                  asin,
              }}
              onLoadStart={() => {
                this.setState({ showLoader: true, checkingLabel: true });
              }}
              onLoadEnd={() => {
                this.setState({ showLoader: false, checkingLabel: false });
              }}
              javaScriptEnabled={true}
              injectedJavaScript={` var content = document.getElementsByTagName('body')[0].innerHTML;  window.ReactNativeWebView.postMessage(content);`}
              onMessage={(e) => {
                console.log("webview loaded data : ", e.nativeEvent.data);

                const checkRes = RestAPI.processHazmatRes(e.nativeEvent.data);
                // Alert.alert('ProcessREs', label)
                console.log("getHazmat  checkRes : ", checkRes);
                this.setState({
                  hazmatLabel: checkRes.result == "hazmat" ? " + HZ" : null,
                });
              }}
            />
          )}
        </View>
        <View
          style={{
            width: Constants.WINDOW_WIDTH,
            position: "absolute",
            left: 0,
            top: 30,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
          }}
        >
          <TouchableOpacity
            style={styles.opacityFlatButton}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Feather name="chevron-left" size={25} color={Constants.green} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.opacityFlatButton}
            onPress={() => {
              this.onShare();
            }}
          >
            <Feather name="share-2" size={20} color={Constants.green} />
          </TouchableOpacity>
        </View>
        <ActionSheet
          title={"Where would you like to do your research?"}
          titleList={["Amazon Listing", "Amazon Restrictions"]}
          isShow={this.state.showResearchAction}
          onTapItem={(index, item) => {
            this.onTapResearchItem(item, index);
            this.setState({ showResearchAction: false });
          }}
          onCancel={() => {
            this.setState({ showResearchAction: false });
          }}
        />
        {this.state.isJungleCheck && (
          <JungleEstimator
            rank={this.state.offersData.productInfo?.rank}
            category={this.state.offersData.productInfo?.category}
            onResult={(res) => {
              showPageLoader(false);
              this.setState({ isJungleCheck: false });
              if (res.estSalesResult) {
                Alert.alert("Estimated Sales Result", res.estSalesResult);
              } else {
                Alert.alert(
                  "Sorry",
                  "We don't have enough data to show estimated sales in the last 30 days."
                );
              }
            }}
            onBegin={() => {}}
            onError={() => {
              Alert.alert(
                "Sorry!",
                "We don't have enough data to show estimated sales in the last 30 days."
              );
            }}
          />
        )}

        <Modal
          animationType={"slide"}
          transparent={true}
          visible={this.state.showEditModal}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: Constants.WINDOW_WIDTH,
              height: Constants.WINDOW_HEIGHT,
              backgroundColor: "rgba(1,1,1,0.3)",
            }}
            activeOpacity={1}
            onPress={() => {
              this.setState({ showEditModal: false });
            }}
          >
            <View
              style={{
                width: Constants.WINDOW_WIDTH * 0.9,
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: Constants.white,
                zIndex: 9999999,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 16, color: Constants.primaryColor }}>
                Enter Cost/Unit:
              </Text>
              <InputOutLine
                placeholderTextColor={Constants.greyWhite}
                placeholder={"Cost/Unit"}
                style={{
                  backgroundColor: Constants.white,
                  borderColor: Constants.greyWhite,
                  borderWidth: 1,

                  width: "100%",
                  height: 40,
                  color: Constants.primaryColor,
                  marginTop: 10,
                }}
                textInputStyle={{
                  fontSize: 16,
                  fontWeight: "bold",
                }}
                textAlign={"right"}
                keyboardType={
                  Platform.OS == "android"
                    ? "phone-pad"
                    : "numbers-and-punctuation"
                }
                value={
                  this.state.selPrice ??
                  this.state.offersData?.productInfo?.price ??
                  0
                }
                icon={
                  <Text
                    style={{ fontSize: 18, color: Constants.secondaryColor }}
                  >
                    $
                  </Text>
                }
                onChangeText={(val) => {
                  try {
                    let temp = parseFloat(val);
                    temp = isNaN(temp) ? 0 : temp;
                    this.setState({ selPrice: val });
                  } catch (ex) {
                    console.error(ex);
                    Alert.alert("Input error", "Please enter correct price");
                  }
                }}
                onSubmitEditing={() => {
                  this.setState({ showEditModal: false });
                  this.calcTotalNetROI(this.state.offersData?.expenses, {
                    price: this.state.selPrice,
                  });
                }}
              />
              <FillButton
                title={"Done"}
                style={{
                  width: "100%",
                  marginTop: 15,
                  backgroundColor: Constants.green,
                }}
                onPress={() => {
                  this.setState({ showEditModal: false });

                  this.calcTotalNetROI(this.state.offersData?.expenses, {
                    price: this.state.selPrice,
                  });
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
}

export default function () {
  const navigation = useNavigation();
  const route = useRoute();

  const dispatch = useDispatch();
  const curRole = useSelector((state) => state.role.curRole);
  const setting = useSelector((state) => state.setting.settingData);

  return (
    <Index
      navigation={navigation}
      route={route}
      dispatch={dispatch}
      curRole={curRole}
      setting={setting}
    />
  );
}

export const OffersView = ({
  fbaList = [],
  newList = [],
  usedList = [],
  onTapCost,
}) => {
  return (
    <View style={{ width: "100%", paddingHorizontal: 10 }}>
      <View style={{ flexDirection: "row", width: "100%" }}>
        <View
          style={{
            ...styles.offerCellHeader,
            backgroundColor: Constants.orange,
          }}
        >
          <Text style={{ color: Constants.white, fontSize: 15 }}>New</Text>
        </View>
        <View
          style={{
            ...styles.offerCellHeader,
            backgroundColor: Constants.green,
          }}
        >
          <Text style={{ color: Constants.white, fontSize: 15 }}>Used</Text>
        </View>
        <View
          style={{
            ...styles.offerCellHeader,
            backgroundColor: Constants.secondaryColor,
          }}
        >
          <Text style={{ color: Constants.white, fontSize: 15 }}>FBA</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", width: "100%" }}>
        <View
          style={{
            ...styles.offerCell,
            backgroundColor: Constants.lightOrange,
          }}
        >
          {newList.map((one, index) => {
            return (
              <TouchableOpacity
                key={"news_" + index}
                style={{ height: 35, justifyContent: "center" }}
                onPress={() => {
                  onTapCost(one?.amount);
                }}
              >
                <Text style={{ color: Constants.primaryColor, fontSize: 17 }}>
                  ${one?.amount ?? "--"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View
          style={{ ...styles.offerCell, backgroundColor: Constants.lightGreen }}
        >
          {usedList.map((one, index) => {
            return (
              <TouchableOpacity
                key={"used_" + index}
                style={{ height: 35, justifyContent: "center" }}
                onPress={() => {
                  onTapCost(one?.amount);
                }}
              >
                <Text style={{ color: Constants.primaryColor, fontSize: 17 }}>
                  ${one?.amount ?? "--"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View
          style={{
            ...styles.offerCell,
            backgroundColor: Constants.lightSecondColor,
          }}
        >
          {fbaList.map((one, index) => {
            return (
              <TouchableOpacity
                key={"fba_" + index}
                style={{ height: 35, justifyContent: "center" }}
                onPress={() => {
                  onTapCost(one?.amount);
                }}
              >
                <Text style={{ color: Constants.primaryColor, fontSize: 17 }}>
                  ${one?.amount ?? "--"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.backColor,

    alignItems: "stretch",
  },
  label: { fontSize: 15 },
  labelCaption: { fontSize: 19, fontWeight: "bold" },
  mainContainer: { paddingTop: 0, flex: 1 },
  profitRow: {
    width: "70%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  resultTitle: {
    color: Constants.secondaryColor,
    fontSize: 13,
    paddingVertical: 7,
    width: "100%",
    textAlign: "center",
  },
  topContainer: {
    backgroundColor: Constants.white,
    width: "100%",
    padding: 10,
  },
  detailTopContainer: {
    backgroundColor: Constants.secondaryColor,
    elevation: 3,
    shadowOffset: {
      width: 5,
      height: 10,
    },
    padding: 5,
  },
  rowTop: {
    flexDirection: "row",
    width: "100%",
  },
  offerCell: {
    flex: 1,
    alignItems: "center",
  },
  offerCellHeader: {
    flex: 1,
    alignItems: "center",

    alignItems: "center",
    justifyContent: "center",
    height: 30,
  },

  opacityFlatButton: {
    backgroundColor: Constants.opacityBlack,
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

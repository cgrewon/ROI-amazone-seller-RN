import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

import {useDispatch, useSelector } from "react-redux";

import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "../../../utils/Constants";
import RestAPI from "../../../utils/RestAPI";
import Feather from "react-native-vector-icons/Feather";

import { InputOutLine } from "../../../components/Inputs";

import Item from "./views/item";

export const SearchEmptyView = ({}) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Image
        source={require("../../../../assets/logo.png")}
        style={{
          width: Constants.WINDOW_WIDTH * 0.4,
          height: Constants.WINDOW_WIDTH * 0.4,
          opacity: 0.5,
        }}
      />
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          Welcome to the{" "}
        </Text>
        <Text style={{ fontSize: 35, fontWeight: "bold" }}>FUTURE!</Text>
      </View>
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "gray" }}>
          Search
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "gray" }}>
          {"  "}|{"  "}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "gray" }}>
          History
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "gray" }}>
          {"  "}|{"  "}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "gray" }}>
          Scan
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "gray" }}>
          {"  "}|{"  "}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "gray" }}>
          Setting
        </Text>
      </View>

      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Image
          source={require("../../../../assets/left-down-arr.png")}
          style={{
            flex: 1,
          }}
        />
        <Image
          source={require("../../../../assets/left-down-arr.png")}
          style={{
            flex: 1,
          }}
        />
        <Image
          source={require("../../../../assets/right-down-arr.png")}
          style={{
            flex: 1,
          }}
        />
        <Image
          source={require("../../../../assets/right-down-arr.png")}
          style={{
            flex: 1,
          }}
        />
      </View>
    </View>
  );
};

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: "",
      data: [],
      isLoading: false,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;

    this._focus = navigation.addListener("focus", () => {

      const { route } = this.props;

      const data = route.params?.data;
      const keyword = route.params?.keyword;

      if (Array.isArray(data) && data.length > 0) {
        this.setState({ data: data, searchText: keyword });
      }
    });
  }

  openJungleScout = (rank, category) => {
    const { navigation } = this.props;
    const title = "Jungle Estimator";
    const link = "https://junglescout.com/estimator";

    navigation.navigate("webpage", { title, link, rank, category });
  };

  componentWillUnmount() {
    if (this._focus) {
      this._focus();
    }
    if (this._blur) {
      this._blur();
    }
  }

  loadData = (isReload) => {
    const { searchText } = this.state;
    let searchKey = searchText.trim();
    if (!searchKey) {
      Alert.alert("Validation", "Please enter search keyword.");
      return;
    }

    const data = {
      api_version: 1,
      user_id: global.curUser.id,
      param: searchKey,
    };
    this.setState({ isLoading: true });
    RestAPI.generalPost("app/item_search", data)
      .then((res) => {
        this.setState({ isLoading: false });
        this.setState({ data: res ?? [] });
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        Alert.alert("Failed", err.message);
      });
  };

  onDetail = (data) => {
    const { navigation } = this.props;

    navigation.navigate("item_detail", { data: data });
  };

  onCleanSearch = () => {
    this.setState({ data: [], searchText: "" });
  };
  render() {
    return (
      <>
        <SafeAreaView style={{ flex: 0 }}></SafeAreaView>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <StatusBar
              barStyle={"dark-content"}
              backgroundColor={Constants.white}
              hidden={false}
            />
            <View
              style={{
                backgroundColor: Constants.white,
                paddingVertical: 5,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowRadius: 3,
                shadowOpacity: 0.3,
                elevation: 3,
              }}
            >
              <InputOutLine
                placeholderTextColor={Constants.greyWhite}
                placeholder={"Search for an item"}
                style={{
                  backgroundColor: Constants.white,
                  borderColor: Constants.greyWhite,
                  borderWidth: 1,
                  width: Constants.WINDOW_WIDTH * 0.95,
                  height: 40,
                  color: Constants.primaryColor,
                  marginTop: 0,
                }}
                autoCapitalize={"characters"}
                value={this.state.searchText}
                icon={
                  <Feather name={"search"} size={20} color={Constants.green} />
                }
                onChangeText={(val) => {
                  this.setState({ searchText: val });
                }}
                onSubmitEditing={() => {
                  this.loadData(true);
                }}
              />
              {!!this.state.searchText && (
                <TouchableOpacity
                  style={{ position: "absolute", right: 20, top: 15 }}
                  onPress={this.onCleanSearch}
                >
                  <Feather name="x" color={Constants.green} size={20} />
                </TouchableOpacity>
              )}
              {this.state.data && this.state.data.length > 0 && (
                <View
                  style={{
                    width: Constants.WINDOW_WIDTH,
                    backgroundColor: Constants.white,
                    marginTop: 5,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={styles.resultTitle}>
                    {this.state.data?.length} results for "
                    {this.state.searchText}"
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.mainContainer}>
              {this.state.data && this.state.data.length > 0 ? (
                <FlatList
                  data={this.state.data}
                  renderItem={({ item, index, sep }) => {
                    return (
                      <Item
                        item={item}
                        onTapItem={() => {
                          this.onDetail(item);
                        }}
                      />
                    );
                  }}
                  keyExtractor={(item, index) => "" + index}
                  refreshing={this.state.isLoading}
                  onRefresh={() => {
                    this.loadData(true);
                  }}
                  onEndReachedThreshold={0.5}
                  onEndReached={() => {
                  }}
                />
              ) : (
                <SearchEmptyView />
              )}
            </View>
          </View>
        </SafeAreaView>
      </>
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

    alignItems: "stretch",
  },
  mainContainer: { paddingTop: 0, flex: 1, paddingHorizontal: 5 },
  resultTitle: {
    color: Constants.secondaryColor,
    fontSize: 13,
    width: "100%",
    textAlign: "center",
  },
});

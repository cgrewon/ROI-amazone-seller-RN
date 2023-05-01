import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "../../../utils/Constants";
import RestAPI from "../../../utils/RestAPI";
import Feather from "react-native-vector-icons/Feather";
import { InputOutLine } from "../../../components/Inputs";
import { SearchEmptyView } from "../search";

import Item from "./views/item";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this._page = 1;
    this._isScrolled = false;

    this.state = {
      searchText: "",
      data: [],
      isLoading: false,
    };
  }

  componentDidMount() {
    this.loadData(true);
    const { navigation } = this.props;
    this._focus = navigation.addListener("focus", () => {
      this.loadData(true);
    });
  }

  componentWillUnmount() {
    if (this._focus) {
      this._focus();
    }
  }

  loadData = (isReload) => {
    const { searchText } = this.state;
    let searchKey = searchText.trim();
    if (isReload) {
      this._page = 1;
    } else {
      if (this.state.data.length < 10) {
        return;
      }
      this._page += 1;
    }

    const data = {
      api_version: 1,
      user_id: global.curUser.id,
      param: searchKey,
      page: this._page,
    };
    this.setState({ isLoading: true });
    RestAPI.generalPost("app/get_history", data)
      .then((res) => {
        let data = res ?? [];
        this.setState({ isLoading: false });
        if (this._page > 1) {
          data = [...this.state.data, ...data];
        }
        this.setState({ data: data });
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        Alert.alert("Failed", err.message);
      });
  };

  onTapDetails = (item, isHistory = 0) => {
    const { navigation } = this.props;
    navigation.navigate("item_detail", { data: item, isHistory });
  };

  onCleanSearch = () => {
    this.setState({ data: [], searchText: "" });
    this._page = 1;
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
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 5,
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
                placeholder={"Search History"}
                style={{
                  backgroundColor: Constants.white,
                  borderColor: Constants.greyWhite,
                  borderWidth: 1,
                  width: Constants.WINDOW_WIDTH * 0.95,
                  height: 40,
                  color: Constants.primaryColor,
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
                          this.onTapDetails(item, 1);
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
                    this.loadData(false);
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

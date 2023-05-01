import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from "react-native";

import { useSelector } from "react-redux";
import { PieChart } from "react-native-svg-charts";
import { Text as SVGText, TSpan } from "react-native-svg";
import Constants from "../../../../utils/Constants";
import Utils from "../../../../utils/Utils";
import { FillButton } from "../../../../components/Buttons";
import Feather from "react-native-vector-icons/Feather";
import { InputOutLine } from "../../../../components/Inputs";
import Divider from "../../../../components/Divider";

const Labels = ({ slices, height, width, expenses, netProfit }) => {
  return slices.map((slice, index) => {
    const { pieCentroid, data } = slice;

    let val = index == 0 ? expenses : netProfit;
    let caption = index == 0 ? "Expenses" : "NetProfit";
    let label = val > 0 ? "$" + val : "-$" + Math.abs(val);
    return (
      <SVGText
        key={index}
        x={pieCentroid[0]}
        y={pieCentroid[1]}
        fill={Constants.primaryColor}
        textAnchor={"middle"}
        alignmentBaseline={"middle"}
        fontSize={13}
        stroke={"black"}
        strokeWidth={0.2}
      >
        <TSpan> {caption}</TSpan>
        <TSpan x={pieCentroid[0]} dy={15}>
          {label}
        </TSpan>
      </SVGText>
    );
  });
};

export default ProfitaView = ({
  expenses,
  listPrice,
  selPrice,
  onChangedCost,
}) => {
  const {
    cost,
    tax,
    referal,
    fulfillment,
    closing,
    shipping,
    storage,
    prep_cost,
  } = expenses;

  let cost_parse = parseFloat(selPrice ?? cost);
  cost_parse = isNaN(cost_parse) ? 0 : cost_parse;

  const setting = useSelector((state) => state.setting.settingData);

  const calcTotal = () => {
    let taxIncurred = (setting?.sales_tax / 100) * costVal;

    let total =
      parseFloat(costVal) +
      // parseFloat(tax) +
      parseFloat(taxIncurred) +
      parseFloat(referal) +
      parseFloat(fulfillment) +
      parseFloat(closing) +
      parseFloat(shipping) +
      parseFloat(prep_cost) +
      parseFloat(storage);
    total = Math.round(total * 100) / 100;

    return total;
  };

  let total = calcTotal();
  const [totalVal, setTotalVal] = React.useState(total);
  const [costVal, setCostVal] = React.useState(selPrice ?? 0);

  const [showCostModal, setShowCostModal] = React.useState(false);

  let listPriceVal = parseFloat(listPrice);

  if (isNaN(listPriceVal)) {
    listPriceVal = 0.0;
  }

  let netProfit = listPriceVal - totalVal;
  netProfit = Math.round(netProfit * 100) / 100;
  console.log(
    "netProfit = listPrice - totalVal :>> ",
    netProfit,
    "=",
    listPriceVal,
    "-",
    totalVal
  );

  const rateNet =
    (100 / (totalVal + Math.abs(netProfit))) * Math.abs(netProfit);
  let endAngle =
    netProfit > 0
      ? (90 * Math.PI) / 180
      : ((90 + (180 * rateNet) / 100) * Math.PI) / 180;

  const getChartData = () => {
    let listPriceVal = parseFloat(listPrice);

    if (isNaN(listPriceVal)) {
      listPriceVal = 0.0;
    }
    let total = calcTotal();

    let netProfit = Math.abs(listPriceVal - total);
    netProfit = Math.round(netProfit * 100) / 100;
    console.log("netProfit: at getChartData > ", netProfit);
    const rateExpenses = (100 / (total + netProfit)) * total;
    const rateNet = (100 / (total + netProfit)) * netProfit;

    return [
      {
        key: 1,
        amount: rateExpenses,
        svg: { fill: Constants.lightGreen },
      },
      {
        key: 2,
        amount: rateNet,
        svg: {
          fill:
            listPriceVal - total >= 0
              ? Constants.orange
              : Constants.googleColor,
        },
      },
    ];
  };

  useEffect(() => {
    let chart = getChartData();
    setChartData(chart);
  }, [totalVal]);

  useEffect(() => {
    let val = calcTotal();
    setTotalVal(val);
  }, [expenses]);

  let chartDataInit = getChartData();

  const [chartData, setChartData] = React.useState(chartDataInit);

  let taxIncurred = (setting?.sales_tax / 100) * costVal;

  return (
    <View
      style={{ alignItems: "center", width: "100%", paddingHorizontal: 10 }}
    >
      <View style={styles.profitRow}>
        <Text
          style={{ ...styles.label, fontSize: 14, color: Constants.lightBlue }}
        >
          Sales Tax:
        </Text>
        <Text
          style={{
            ...styles.labelCaption,
            color: Constants.lightBlue,
            fontSize: 15,
          }}
        >
          {Utils.getFormatFloat(setting?.sales_tax)}%
        </Text>
        <Text
          style={{ ...styles.label, fontSize: 14, color: Constants.lightBlue }}
        >
          Discount:
        </Text>
        <Text
          style={{
            ...styles.labelCaption,
            color: Constants.lightBlue,
            fontSize: 15,
          }}
        >
          0.00%
        </Text>
      </View>
      <View style={styles.profitRow}>
        <Text style={{ fontWeight: "bold", fontSize: 15 }}>Expenses</Text>
      </View>
      <View style={styles.profitRow}>
        <Text style={styles.label}>Cost/Unit:</Text>
        <Text style={styles.labelCaption}>
          ${Utils.getFormatFloat(costVal)}
        </Text>
        <TouchableOpacity
          style={{ position: "absolute", right: -30, top: 5, zIndex: 100 }}
          onPress={() => {
            setShowCostModal(true);
          }}
        >
          <Feather name={"edit-2"} size={20} color={Constants.green} />
        </TouchableOpacity>
      </View>
      <View style={styles.profitRow}>
        <Text style={styles.label}>Tax Incurred:</Text>
        <Text style={styles.labelCaption}>
          {/* ${Utils.getFormatFloat(tax) + ''} */}$
          {Utils.getFormatFloat(taxIncurred)}
        </Text>
      </View>
      <View style={styles.profitRow}>
        <Text style={styles.label}>Amazon Referal Fee:</Text>
        <Text style={styles.labelCaption}>
          ${Utils.getFormatFloat(referal)}
        </Text>
      </View>
      <View style={styles.profitRow}>
        <Text style={styles.label}>FBA Fulfillment Fee:</Text>
        <Text style={styles.labelCaption}>
          ${Utils.getFormatFloat(fulfillment)}
        </Text>
      </View>
      <View style={styles.profitRow}>
        <Text style={styles.label}>Closing Fee:</Text>
        <Text style={styles.labelCaption}>
          ${Utils.getFormatFloat(closing)}
        </Text>
      </View>
      <View style={styles.profitRow}>
        <Text style={styles.label}>Est. Shipping:</Text>
        <Text style={styles.labelCaption}>
          ${Utils.getFormatFloat(shipping)}
        </Text>
      </View>
      <View style={styles.profitRow}>
        <Text style={styles.label}>Monthly Storage:</Text>
        <Text style={styles.labelCaption}>
          ${Utils.getFormatFloat(storage)}
        </Text>
      </View>

      <View style={styles.profitRow}>
        <Text style={styles.label}>Prep Cost:</Text>
        <Text style={styles.labelCaption}>
          ${Utils.getFormatFloat(prep_cost)}
        </Text>
      </View>

      <Divider color={Constants.greyWhite} style={{ width: "70%" }} />

      <View style={styles.profitRow}>
        <Text style={styles.label}>Total Expenses:</Text>
        <Text style={styles.labelCaption}>
          ${Utils.getFormatFloat(totalVal)}
        </Text>
      </View>

      <View
        style={{
          marginTop: 20,
          width: Constants.WINDOW_WIDTH * 0.8,
          height: Constants.WINDOW_WIDTH * 0.8,
        }}
      >
        <PieChart
          style={{ height: Constants.WINDOW_WIDTH * 0.9 }}
          valueAccessor={({ item }) => item.amount}
          data={chartData}
          spacing={1}
          outerRadius={"95%"}
          startAngle={(-90 * Math.PI) / 180}
          endAngle={endAngle}
        >
          <Labels expenses={totalVal} netProfit={netProfit} />
        </PieChart>
        <Text
          style={{
            fontSize: 15,
            color: Constants.primaryColor,
            position: "absolute",
            top: Constants.WINDOW_WIDTH * 0.45 - 20,
            width: "100%",
            textAlign: "center",
          }}
        >
          {"List Price\n$" + listPrice}
        </Text>
      </View>
      <Modal animationType={"slide"} transparent={true} visible={showCostModal}>
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
            let val = calcTotal();
            setTotalVal(val);
            setShowCostModal(false);
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
                // textAlign:"right",
                fontSize: 16,
                fontWeight: "bold",
              }}
              textAlign={"right"}
              keyboardType={
                Platform.OS == "android"
                  ? "phone-pad"
                  : "numbers-and-punctuation"
              }
              value={"" + costVal}
              icon={
                <Text style={{ fontSize: 18, color: Constants.secondaryColor }}>
                  $
                </Text>
              }
              onChangeText={(val) => {
                try {
                  let temp = parseFloat(val);
                  temp = isNaN(temp) ? 0 : temp;
                  setCostVal(val);
                  if (onChangedCost) {
                    let updatedExpenses = { ...expenses };
                    updatedExpenses.cost = temp;
                    onChangedCost(updatedExpenses, listPrice);
                  }
                } catch (ex) {
                  console.error(ex);
                  Alert.alert("Input error", "Please enter correct price");
                }
              }}
              onSubmitEditing={() => {
                let val = calcTotal();
                setTotalVal(val);
                setShowCostModal(false);
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
                let val = calcTotal();
                setTotalVal(val);
                setShowCostModal(false);
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    alignItems: "center",
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
});

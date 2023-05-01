import { Platform } from "react-native";
import base64 from "react-native-base64";

export const serverURL = "http://app.roiscanner.com/";
export const hostURL = serverURL;
export const uploadsHostUrl = "http://app.roiscanner.com";

const futch = (url, opts = {}, onProgress) => {
  return new Promise((res, rej) => {
    var xhr = new XMLHttpRequest();
    xhr.open(opts.method || "get", url);
    for (var k in opts.headers || {}) xhr.setRequestHeader(k, opts.headers[k]);
    xhr.onload = (e) => res(e.target);
    xhr.onerror = rej;
    if (xhr.upload && onProgress) xhr.upload.onprogress = onProgress;
    xhr.send(opts.body);
  });
};

export const xhr = () => {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtaW46MTIzNDU2");
  myHeaders.append(
    "x-roiscanner-api-key",
    "875462fc8c49988716172625f7975d03df683011"
  );
  myHeaders.append(
    "Cookie",
    "mycookie=ff7607d4f9140ee8c301133873f393cfebdb8ae4"
  );

  var formdata = new FormData();
  formdata.append("api_version", "1");
  formdata.append("user_email", "dev@roiscanner.com");
  formdata.append("password", "123456");
  formdata.append("device_id", "phone device id");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  fetch("http://app.roiscanner.com/app/login", requestOptions)
    .then((response) => response.text())
    .then((result) => console.warn(result))
    .catch((error) => console.error("error", error));
};

export const FBACategories = [
  "Toys & Games",
  "Beauty & Personal Care",
  "Health & Household",
  "Automotive",
  "Tools & Home Improvement",
  "Grocery & Gourmet Food",
  "Home & Kitchen",
  "Patio, Lawn & Garden",
  "Kitchen & Dining",
  "Sports & Outdoors",
  "Pet Supplies",
  "Arts, Crafts & Sewing",
  "Office Products",
  "Baby",
  "Cell Phones & Accessories",
  "Industrial & Scientific",
  "Electronics",
  "Musical Instruments",
  "Video Games",
  "Books",
];

export const JungleScoutCategories = [
  "Appliances",
  "Arts, Crafts & Sewing",
  "Automotive",
  "Baby",
  "Beauty & Personal Care",
  "Camera & Photo",
  "Cell Phones & Accessories",
  "Clothing, Shoes & Jewelry",
  "Computers & Accessories",
  "Electronics",
  "Grocery & Gourmet Food",
  "Health & Household",
  "Home & Kitchen",
  "Industrial & Scientific",
  "Kitchen & Dining",
  "Musical Instruments",
  "Office Products",
  "Patio, Lawn & Garden",
  "Pet Supplies",
  "Software",
  "Sports & Outdoors",
  "Tools & Home Improvement",
  "Toys & Games",
  "Video Games",
];

const requestCall = (
  subUrl,
  method,
  body,
  callBack,
  isFullUrl = false,
  isResponseJson = true
) => {
  let myHeaders = new Headers();

  myHeaders.append("Authorization", "Basic YWRtaW46MTIzNDU2");
  myHeaders.append(
    "x-roiscanner-api-key",
    "875462fc8c49988716172625f7975d03df683011"
  );

  let reqParams = {
    method: method,
    headers: myHeaders,
    redirect: "follow",
  };

  if (body !== null) {
    reqParams.body = JSON.stringify(body);
  }

  let fullUrl = isFullUrl ? subUrl : hostURL + subUrl;
  console.log("fullUrl:", fullUrl, " , isFullUrl: ", isFullUrl);
  if (isResponseJson == false) {
    fetch(fullUrl, reqParams).then(function (response) {
      console.log("response: LINE 42", response);
      return response.text().then((text) => {
        callBack(text, null);
      });
    });
  } else {
    fetch(fullUrl, reqParams)
      .then(function (response) {
        const status = response.ok ? 200 : response.status;

        response.json().then((data) => {
          if (status == 200) {
            console.log("status 200 : ", data);
            if (data.status == 1) {
              callBack(data, null);
            } else {
              let err = {
                msg: data.message,
              };

              callBack(data, err);
            }
          } else {
            let field = null;
            let msg = null;
            if (data.length > 0) {
              field = data[0].field;
              msg = data[0].message;
            }
            let resObj = { field, msg };
            callBack(resObj, status);
          }
        });
      })
      .catch(function (err) {
        console.log("err: LINE 64", err);
        callBack(null, err);
      });
  }
};

function BearerHeader(token) {
  const header = {
    Authorization: "Bearer " + token,
  };
  return header;
}

const formDataCall = (
  subUrl,
  method,
  body,
  headers,
  callBack,
  isFullLink = false
) => {
  let link = isFullLink ? subUrl : hostURL + subUrl;

  futch(
    link,
    {
      method: method,
      body: body,
      headers: headers,
    },
    (progressEvent) => {
      const progress = progressEvent.loaded / progressEvent.total;
      console.log(progress);
    }
  ).then(
    function (resJson) {
      console.log("formDataCall response from server!>>>>>|||>>|:> ", resJson);

      try {
        let res = JSON.parse(resJson.response);
        console.log("after parsing: ", res);
        if (resJson.status == 200) {
          if (res.status == 1) {
            callBack(res, null);
          } else {
            callBack(res, res);
          }
        } else {
          let field = null;
          let msg = null;
          if (res.length > 0) {
            field = res[0].field;
            msg = res[0].message;
          }

          let resObj = { field, msg };

          callBack(resObj, resJson.status);
        }
      } catch (exception) {
        console.log(exception);
        callBack(null, exception);
      }
    },
    (err) => {
      console.log("parsing err ", err);
      callBack(null, err);
    }
  );
};

const RestAPI = {
  fullUrl: (url) => {
    return hostURL + url;
  },

  generalGet: (apiSubUrl, isResponseJson = true) => {
    return new Promise((resolve, reject) => {
      requestCall(
        "/" + apiSubUrl,
        "GET",
        null,
        (res, err) => {
          if (err) {
            console.log(
              "LINE 204 Error while calling API [" +
                apiSubUrl +
                "] >>>>>>>>>>>>>>>err, res ",
              err,
              res
            );
            let errObj = { status: err, ...res };
            reject(errObj);
          } else {
            console.log(
              "LINE 208 Success in [" + apiSubUrl + "] calling : >>>>>>>>>>> ",
              res
            );
            resolve(res);
          }
        },
        false,
        isResponseJson
      );
    });
  },

  generalPost: (apiSubUrl, data, isJson = true) => {
    console.log("generalPost jsonData > ", data);

    return new Promise((resolve, reject) => {
      var myHeaders = new Headers();
      myHeaders.append("Authorization", "Basic YWRtaW46MTIzNDU2");
      myHeaders.append(
        "x-roiscanner-api-key",
        "875462fc8c49988716172625f7975d03df683011"
      );

      var formdata = new FormData();
      if (data) {
        for (let k in data) {
          formdata.append(k, data[k]);
        }
      }
      formdata.append("platform", Platform.OS);

      let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      if (isJson) {
        fetch(serverURL + apiSubUrl, requestOptions)
          .then((response) => response.json())
          .then((result) => {
            if (Object.keys(result).includes("status")) {
              if (result.status == 1) {
                resolve(result);
              } else {
                reject(result);
              }
            } else {
              resolve(result);
            }
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        fetch(serverURL + apiSubUrl, requestOptions)
          .then((response) => response.text())
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },

  generalFormPost: (subUrl, formData) => {
    var headers = new Headers();
    headers.append("Authorization", "Basic YWRtaW46MTIzNDU2");
    headers.append(
      "x-roiscanner-api-key",
      "875462fc8c49988716172625f7975d03df683011"
    );

    return new Promise((resolve, reject) => {
      formDataCall("/" + subUrl, "post", formData, headers, (res, err) => {
        console.log("register result : ", res, err);

        if (err) {
          console.log(
            "LINE 204 Error while calling API [" +
              subUrl +
              "] >>>>>>>>>>>>>>>err, res ",
            err,
            res
          );
          let errObj = { status: err, ...res };
          reject(errObj);
        } else {
          console.log(
            "LINE 208 Success in [" + subUrl + "] calling : >>>>>>>>>>> ",
            res
          );
          resolve(res);
        }
      });
    });
  },

  getSellerCentralResult: (asin, cookie) => {
    let cookieString = "";

    for (let key in cookie) {
      if (cookieString.length > 0) {
        cookieString += ";";
      }
      cookieString += " " + key + "=" + cookie[key].value;
    }

    let headers = cookie
      ? {
          cookie: cookieString,
        }
      : {};

    return new Promise((resolve, reject) => {
      fetch(
        "https://sellercentral.amazon.com/productsearch/search?query=" + asin,
        {
          method: "GET",
          headers: headers,
        }
      )
        .then((response) => {
          console.log(response);

          const status = response.ok ? 200 : response.status;

          response.json().then((data) => {
            if (status == 200) {
              console.log("status 200 : ", data);
              resolve(data);
            } else {
              reject(data);
            }
          });
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  },

  processAws: (t, e) => {
    var r = { result: "can_i_sell" };
    if (!e.products || 0 == e.products.length) return r;
    var n = e.products[0];
    if (n.asin !== t) return r;
    var a = false,
      o = false;
    if (n.qualificationMessages && n.qualificationMessages.length) {
      if (
        (n.qualificationMessages.map(function (t) {
          if (!t.conditionList || t.conditionList.match(/new/i)) {
            var e = t.qualificationMessage;
            e &&
              e.match(
                /The product you are trying to sell is Transparency enabled./
              ) &&
              (a = true),
              e.match(/You need approval/)
                ? (r = { result: "need_approval" })
                : e.match(
                    /You are not approved to list this product. You will need to contact the brand owner to become an authorized seller of this product on Amazon/
                  )
                ? (r = { result: "need_approval" })
                : e.match(/You are not approved to list/)
                ? o || (r = { result: "restricted" })
                : e.match(/you must be a resident of the USA/) &&
                  ((r = { result: "need_approval" }), (o = true)),
              "Currently, you cannot list this ASIN." === e &&
                (r = { result: "restricted" });
          }
        }),
        "can_i_sell" === r.result)
      )
        n.conditionGatingStatuses.map(function (t) {
          "new" === t.condition && (t.gated || (r.result = "sell_yours"));
        });
      "can_i_sell" === r.result && a && (r.result = "need_approval");
    }
    return (r.transparency = a), r;
  },

  getAwsRestrictionLabel: (result) => {
    let resultlabel = "Unknown";
    if ("can_i_sell" === result) resultlabel = "Can I Sell?";
    else if ("restricted" === result) resultlabel = "Restr?";
    else if ("need_approval" === result) {
      resultlabel = "Req Apr?";
    } else if ("sell_yours" === result) {
      resultlabel = "Sell-New?";
    } else {
      resultlabel = "Unknown";
    }
    return resultlabel;
  },

  getHazmat: (asin, cookie) => {
    let cookieString = "";

    for (let key in cookie) {
      if (cookieString.length > 0) {
        cookieString += ";";
      }
      cookieString += " " + key + "=" + cookie[key].value;
    }

    let headers = cookie
      ? {
          cookie: cookieString,
        }
      : {};

    return new Promise((resolve, reject) => {
      fetch(
        "https://sellercentral.amazon.com/hz/m/sourcing/inbound/eligibility?ref_=ag_src-elig_cont_src-mdp&asin=" +
          asin,
        {
          method: "GET",
          headers: headers,
        }
      )
        .then((response) => {
          console.log(
            "GetHazmat response before JSON : ",
            JSON.stringify(response, null, 2)
          );

          const status = response.ok ? 200 : response.status;
          resolve(JSON.stringify(response, null, 2));
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  },

  processHazmatRes: (t) => {
    var e = "unknown";
    return (
      (t = t.replace(/\s+/g, " ")).match("<title.*?>Amazon Sign.In</title>")
        ? (e = "login")
        : t.match(/Product under dangerous goods \(Hazmat\) review/)
        ? (e = "review")
        : t.match(/Product regulated as dangerous goods \(Hazmat\)/) &&
          (e = "hazmat"),
      { result: e }
    );
  },

  generate_vid: (length) => {
    minval = Math.pow(10, length - 1);
    maxval = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (maxval - minval) + minval);
  },

  generate_uid: (prefix) => {
    return "" + prefix + RestAPI.generate_vid(10);
  },

  generate_cookies_for_fbatoolkit: () => {
    let domainHash = "182513137";
    let initialTime = new Date().valueOf();

    let visitorId = RestAPI.generate_vid(10);
    let cfduid = RestAPI.generate_uid("dc6a3e79c1428966d3a8766f2b290e");
    let utma = RestAPI.generate_utma(
      domainHash,
      visitorId,
      initialTime,
      initialTime,
      initialTime
    );
    return `__cfduid=${cfduid}; _utmz=${domainHash}.${initialTime}.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); marketchecker-check=no; _utmc=${domainHash}; ${utma}; _utmt=1; _utmb=${domainHash}.1.10.${initialTime}`;
  },

  generate_utma: (
    domainHash,
    visitorId,
    initialTime,
    prevSession,
    currentTime
  ) => {
    return `__utma=${domainHash}.${visitorId}.${initialTime}.${prevSession}.${currentTime}.1`;
  },

  get_estimated_sales: (data) => {
    let cookies = RestAPI.generate_cookies_for_fbatoolkit();
    let headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
      Referer: "https://fbatoolkit.com/",
      Cookie: cookies,
    };
    let category = data.category;
    console.log("category:: ", category);

    let base64_category = base64.encode(category);

    console.log("base64 res : ", base64_category);
    let url =
      "https://fbatoolkit.com/estimate_ajax?category=" +
      base64_category +
      "&rank=" +
      data.rank;

    let reqParams = {
      method: "GET",
      headers: headers,
      redirect: "follow",
    };

    return new Promise((resolve, reject) => {
      fetch(url, reqParams)
        .then((response) => {
          response.json().then((res) => {
            // console.log("result: ", res);

            let keys = Object.keys(res);
            console.log(
              "keys checking includes sales_per_day_30day_avg: ",
              keys
            );
            if (keys.includes("sales_per_day_30day_avg")) {
              console.log(" sales_per_day_30day_avg value: ", res);
              if (res.sales_per_day_30day_avg) {
                let avg_sales = res.sales_per_day_30day_avg
                  .replace("More than ", "")
                  .replace("Less than ", "");
                if (avg_sales.indexOf("every") != -1) {
                  avg_sales = 1;
                }

                let sales = parseInt(avg_sales) * 30;
                let revenue = null;
                if (!data.price) {
                  revenue = 0;
                } else {
                  revenue =
                    Math.round(sales * parseFloat(data.price) * 100) / 100;
                }

                let resultData = {
                  ...data,
                  sales,
                  revenue,
                };
                resolve(resultData);
              } else {
                reject("We do not have Estimated Sales for this category");
              }
            } else {
              reject("We do not have Estimated Sales for this category");
            }
          });
        })
        .catch((ex) => {
          console.error("exception: ", ex);
          reject(ex.message);
        });
    });
  },
};

export default RestAPI;

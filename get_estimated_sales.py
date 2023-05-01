  def get_estimated_sales(self, data):
        # print("Request to estimated sales")
        logging.info("Request to estimated sales")
        cookies = ScriptHelper.generate_cookies_for_fbatoolkit()
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
            'Referer': 'https://fbatoolkit.com/',
            'Cookie': cookies
        }
        category_bytes = data['category'].encode('ascii')
        base64_bytes = base64.b64encode(category_bytes)
        base64_category = base64_bytes.decode('ascii')
        url = "https://fbatoolkit.com/estimate_ajax?category=" + \
            base64_category + "&rank=" + data['rank']
        response = ScriptHelper.fetch_url(url, "", headers)
        if "sales_per_day_30day_avg" in response:
            result = json.loads(response)
            if result['sales_per_day_30day_avg']:
                avg_sales = result['sales_per_day_30day_avg'].replace(
                    "More than ", "").replace("Less than ", "")
                if "every" in avg_sales:
                    avg_sales = 1
                data['sales'] = int(avg_sales) * 30
                if not data['price']:
                    data['revenue'] = 0
                else:
                    data['revenue'] = round(
                        data['sales'] * float(data['price']), 2)
        return data





def generate_cookies_for_fbatoolkit():
    domainHash = "182513137"
    initialTime = datetime.now().timestamp()
    initialTime = int(initialTime)
    visitorId = generate_vid(10)
    cfduid = generate_uid("dc6a3e79c1428966d3a8766f2b290e")
    utma = generate_utma(domainHash, visitorId,
                         initialTime, initialTime, initialTime)
    return f"__cfduid={cfduid}; _utmz={domainHash}.{initialTime}.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); marketchecker-check=no; _utmc={domainHash}; {utma}; _utmt=1; _utmb={domainHash}.1.10.{initialTime}"


def generate_utma(domainHash, visitorId, initialTime, prevSession, currentTime):
    return f"__utma={domainHash}.{visitorId}.{initialTime}.{prevSession}.{currentTime}.1"


def generate_uid(prefix):
    return prefix + str(generate_vid(10))


def generate_vid(length):
    minval = pow(10, length - 1)
    maxval = 9
    k = 1
    while k < length:
        maxval = 9 * pow(10, k) + maxval
        k += 1
    return random.randint(minval, maxval)

    

"""
 'Toys & Games',
            'Beauty & Personal Care',
            'Health & Household',
            'Automotive',
            'Tools & Home Improvement',
            'Grocery & Gourmet Food',
            'Home & Kitchen',
            'Patio, Lawn & Garden',
            'Kitchen & Dining',
            'Sports & Outdoors',
            'Pet Supplies',
            'Arts, Crafts & Sewing',
            'Office Products',
            'Baby',
            'Cell Phones & Accessories',
            'Industrial & Scientific',
            'Electronics',
            'Musical Instruments',
            'Video Games',
            'Books',
"""



https://api.junglescout.com/api/v1/sales_estimator?rank=11367&category=Patio%2C+Lawn+%26+Garden&store=us

GET /api/v1/sales_estimator?rank=11367&category=Patio%2C+Lawn+%26+Garden&store=us 

HTTP/2

Host: api.junglescout.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:85.0) Gecko/20100101 Firefox/85.0
Accept: application/json, text/javascript, */*; q=0.01
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: https://www.junglescout.com/
Origin: https://www.junglescout.com
Connection: keep-alive

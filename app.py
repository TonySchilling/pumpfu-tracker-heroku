from flask import Flask, render_template, jsonify, request
import pandas as pd
import os
import sqlite3
from aggregation import *
from updateDatabase import *
import json
from databaseManagement import *
import math

app=Flask(__name__)

# conn = sqlite3.connect("pump_fun.db")  # Creates a file called pump_fun.db
# cursor = conn.cursor()

# pd.to_datetime(df['last_trade_timestamp'] / 1000, unit='s')
# df['lastTrade']=pd.to_datetime(df['last_trade_timestamp'] / 1000, unit='s')
# database="pump_fun.db"
# database="pump_fun_database.db"
database="appDatabase.db"



def authenticate_request():
    api_key = request.headers.get("admin-key")  # Custom header
    if api_key != 'testKey':
        return jsonify({"error": "Unauthorized"}), 403

# def basicQuery(query):
#     conn = sqlite3.connect(database)  # Creates a file called pump_fun.db
#     cursor = conn.cursor()
#     try:
#         cursor.execute(query)
#         data=cursor.fetchall()
#     except:
#         print('Coulnt run query')
#     cursor.close()
#     conn.close()

#     return data


def getTokensDf():
    conn = sqlite3.connect(database)
    cursor = conn.cursor()
    # query="SELECT * FROM tokens"
    query='SELECT * FROM tokens ORDER BY last_trade_timestamp DESC LIMIT 30'
    df=pd.read_sql(query, conn)
    conn.close()
    return df

def getTokensData(address):
    conn = sqlite3.connect(database)  # Creates a file called pump_fun.db
    cursor = conn.cursor()
    # address='2J3uWcDQ1AcWH4bUaiuiBfsc782RkPPDQ4RhLLbdpump'
    # cursor.execute(f'SELECT * FROM transactions WHERE mint = "{address}"')
    # cursor.fetchall()
    query=f'SELECT * FROM transactions WHERE mint = "{address}"'
    df=pd.read_sql(query, conn)
    conn.close()
    return df

def getSingleTokenData(address):
    conn = sqlite3.connect(database)  # Creates a file called pump_fun.db
    cursor = conn.cursor()
    query=f'SELECT * FROM tokens WHERE token_address = "{address}"'
    df=pd.read_sql(query, conn)
    conn.close()
    return df


def getTokensTransactions(address):
    conn = sqlite3.connect(database)  # Creates a file called pump_fun.db
    cursor = conn.cursor()
    # address='2J3uWcDQ1AcWH4bUaiuiBfsc782RkPPDQ4RhLLbdpump'
    # cursor.execute(f'SELECT * FROM transactions WHERE mint = "{address}"')
    # cursor.fetchall()
    query=f'SELECT * FROM transactions WHERE mint = "{address}"'
    tf=pd.read_sql(query, conn)
    conn.close()
    tf['date']=pd.to_datetime(tf['blockTime'], unit='s')
    tf['sol']=tf['sol']/10**9
    tf['tokenAmount']=tf['tokenAmount']/1000000
    tf['tradeType'] = tf['tradeType'].astype('str')
    tf.loc[tf['tradeType']=='1', 'sol']=-tf['sol']
    tf.loc[tf['tradeType']=='0', 'tokenAmount']=-tf['tokenAmount']
    tf.loc[tf['tradeType']=='1', 'tradeType']='buy'
    tf.loc[tf['tradeType']=='0', 'tradeType']='sell'

    tf['absSol']=abs(tf['sol'])
    tf['absTokenAmount']=abs(tf['tokenAmount'])
    return tf

def bondingSecondsToString(bondingSeconds):
    days=math.floor(bondingSeconds/86400)
    bondingSeconds-=days*86400
    hours=math.floor(bondingSeconds/3600)
    bondingSeconds-=hours*3600
    minutes=math.floor(bondingSeconds/60)
    bondingSeconds-=minutes*60
    seconds=bondingSeconds
    stringVal=""
    if days>0:
        stringVal+=f'{days}d '
    if hours>0:
        stringVal+=f'{hours}h '
    if minutes>0:
        stringVal+=f'{minutes}m '
    if seconds>0:
        stringVal+=f'{int(seconds)}s'
    if bondingSeconds==0:
        stringVal="0s"
    return stringVal

def getTokenDataAdditional():
    returnData=""
    conn = sqlite3.connect(database)
    try:
        df=getTokensDf()
        df['bond']=(df['last_trade_timestamp']-df['created_timestamp'])/1000
        df.loc[df['bond']<0, 'bond'] = 0
        df['bondStr']=df['bond'].apply(bondingSecondsToString)
        addresses=df['token_address'].unique().tolist()
        placeholders = ', '.join(['?'] * len(addresses))
        query = f"SELECT * FROM transactions WHERE mint IN ({placeholders})"
        tf = pd.read_sql(query, conn, params=addresses)
        tf.loc[tf['tradeType']==0, 'tokenAmount']=-tf['tokenAmount']
        tf['tokenAmount']=tf['tokenAmount']/1000000
        gf0=tf.groupby(['mint', 'owner']).agg({'hash':'count', 'tokenAmount':'sum'})
        gf0=gf0.reset_index()
        gf0.columns=['token_address', 'owner', 'count', 'sum']
        gf1=gf0.groupby('token_address').agg({'count':'sum'}).reset_index()
        gf2=gf0[gf0['sum']>0].groupby('token_address').agg({'owner':'count'}).reset_index()
        gf3=gf1.merge(gf2, on='token_address', how='outer')
        gf3.columns=['token_address', 'transactions', 'holders']
        df=df.merge(gf3, on='token_address', how="left")
        returnData=df
    except:
        print('Error')
    conn.close()

    return returnData


@app.route('/')
def home():
    # df=getTokensDf()
    df=getTokenDataAdditional()
    data = df.to_dict(orient='records')[:5]
    return render_template('index.html', tokenData=data)

@app.route('/getSpecificData', methods=['POST'])
def getSpecificData():

    data=request.json
    print(data)
    query=data['query']
    print(f'query: {query}')
    data=basicQuery(query)

    return jsonify(data)
    


@app.route('/createTables')
def createTables():
    createTokenTable(databaseName="appDatabase.db")
    createTransactionTable(databaseName="appDatabase.db")
    return 

@app.route('/tokens')
def tokens():
    # df=getTokensDf()
    df=getTokenDataAdditional()
    data = df.to_dict(orient='records')
    return jsonify(data)

@app.route('/token_transactions/<token_address>')
def token_transactions(token_address):

    # return render_template('token_details.html')
    tf = getTokensData(token_address) 
    data = tf.to_dict(orient='records')
    if data:
        return jsonify(data)
    else:
        return "Token not found", 404
    
@app.route('/token_details/<token_address>')
def token_details(token_address):
    print(f'THIS IS THE TOKEN ADDRESS!!! {token_address}')
    # return render_template('token_details.html')
    tf = getTokensTransactions(token_address) 
    transactionData = tf.head(20).to_dict(orient='records')
    gf=aggregateTransactions(tf)
    traderData=gf.head(50).to_dict(orient='records')
    df = getSingleTokenData(token_address)
    tokenData = df.to_dict(orient='records')

    summaryData=getTransactionSummary(gf, tf, df)
    data = {'token': tokenData, 'transactions': transactionData, 'aggregation': traderData, 'summaryData':summaryData}
    # data={'test':1, 'test2':2}
    # with open('test.txt', 'w') as f:
    #     f.write(json.dumps(data))
    if data:
        return jsonify(data)
    else:
        return "Token not found", 404

@app.route('/update_database', methods=['POST'])
def update_database():
    data=request.json
    if not data:
        return jsonify({'error':'No data received'}), 400
    
    try:
        # updateTransactionsTable(data['transaction'], databaseName=database)
        # updateTokensTable(data['token'], databaseName=database)
        updateBothTables(data['token'], data['transaction'])
        with open('dataTest.txt', 'w') as f:
            f.write(json.dumps(data))
        # updateTokensTableJson(data['token'])
        # updateTransactionsTableJson(data['transaction'])
    except:
        print('errpr')
    
    else:
        return jsonify({'message':'Data received!'}), 200
    
@app.route('/existing_tokens')
def existing_tokens():
    data=basicQuery("SELECT DISTINCT token_address FROM tokens")

    return jsonify(data)


@app.route('/searchToken', methods=['POST'])
def searchToken():

    data=request.json
    searchTerm=data['searchTerm']
    results=searchForTokens(searchTerm)
    
    return jsonify(results)


@app.route('/resetDatabase')
def resetDatabase():
    reinitializeTable(databaseName="appDatabase.db")

    return jsonify({'message':'DB Reset'}), 200


if __name__=='__main__':
    app.run(debug=True)
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

def predict_stock_prices(df: pd.DataFrame, days_ahead: int = 5):
    df['Days'] = np.arange(len(df))
    X = df[['Days']]
    y = df['Close']

    model = LinearRegression()
    model.fit(X, y)

    future_days = np.arange(len(df), len(df) + days_ahead).reshape(-1, 1)
    predictions = model.predict(future_days)

    return predictions.tolist()

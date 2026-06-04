import sqlalchemy as alchemy
from sqlalchemy import create_engine, text, Table, Column, MetaData, Integer, String, ForeignKey
import pymysql as pms
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL_STRING")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL_STRING environment variable is not set. Please create a .env file and add it.")

# primary key: id and id starts from 2 
engine = create_engine(
   DATABASE_URL,
   connect_args={
      "ssl":{"ssl_mode": "VERIFY_IDENTITY"}
   },
   echo=True,
)


  
  
import sqlalchemy as alchemy
from sqlalchemy import create_engine, text, Table, Column, MetaData, Integer, String, ForeignKey
import pymysql as pms
import os

DATABASE_URL = os.environ["DATABASE_URL_STRING"]

# primary key:id and id starts from 2 
engine = create_engine(
   DATABASE_URL,
   connect_args={
      "ssl":{"ssl_mode": "VERIFY_IDENTITY"}
   },
   echo=True,
)


  
  
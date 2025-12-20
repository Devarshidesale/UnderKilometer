import sqlalchemy as alchemy
from sqlalchemy import create_engine, text, Table, Column, MetaData, Integer, String, ForeignKey
import pymysql as pms

DATABASE_URL = "mysql+pymysql://2G57bbn4J9q1ruD.root:fAzz6Q2HvFbz0guU@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test"

engine = create_engine(
   DATABASE_URL,
   connect_args={
      "ssl":{"ssl_mode": "VERIFY_IDENTITY"}
   },
   echo=True,
)


  
  
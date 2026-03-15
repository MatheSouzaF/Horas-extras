-- ============================================================
-- Backup do Supabase - Horas Extras
-- Gerado automaticamente para migração para PostgreSQL local
-- ============================================================

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- ── Schema ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "User" (
  "id"           TEXT        NOT NULL,
  "name"         TEXT        NOT NULL,
  "email"        TEXT        NOT NULL,
  "passwordHash" TEXT        NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_email_key" UNIQUE ("email")
);

CREATE TABLE IF NOT EXISTS "MonthlyRecord" (
  "id"         TEXT             NOT NULL,
  "userId"     TEXT             NOT NULL,
  "month"      TEXT             NOT NULL,
  "salary"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modelsJson" TEXT             NOT NULL DEFAULT '[]',
  CONSTRAINT "MonthlyRecord_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MonthlyRecord_userId_month_key" UNIQUE ("userId", "month"),
  CONSTRAINT "MonthlyRecord_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "DayEntry" (
  "id"                 TEXT             NOT NULL,
  "monthlyRecordId"    TEXT             NOT NULL,
  "date"               TIMESTAMP(3)     NOT NULL,
  "startTime"          TEXT             NOT NULL,
  "endTime"            TEXT             NOT NULL,
  "workedHours"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt"          TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "projectWorked"      TEXT             NOT NULL DEFAULT '',
  "calculationModelId" TEXT             NOT NULL DEFAULT '',
  CONSTRAINT "DayEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DayEntry_monthlyRecordId_fkey" FOREIGN KEY ("monthlyRecordId")
    REFERENCES "MonthlyRecord"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "RefreshSession" (
  "id"          TEXT         NOT NULL,
  "userId"      TEXT         NOT NULL,
  "tokenHash"   TEXT         NOT NULL,
  "deviceName"  TEXT,
  "userAgent"   TEXT,
  "ipAddress"   TEXT,
  "expiresAt"   TIMESTAMP(3) NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt"  TIMESTAMP(3),
  "revokedAt"   TIMESTAMP(3),
  CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- ── Dados: User ─────────────────────────────────────────────
 INSERT INTO "User" VALUES ('cmlmllozg0000gjma3dvbyplr','Teste User','teste.user.demo+6@gmail.com','$2b$10$PXf71UbTpxTgpIFaOueCFu/UVc61yscQGg/32pSb04pvDD6KEAdea','2026-02-14 17:36:19.131','2026-02-14 17:36:19.131') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmlmln63c0001gjmaaolbuyp9','matheus','matheusdsouza97@gmail.com','$2b$10$Zf7oXfkFiJQzEJ8z46L2MO5VdwTXh0/voApXB7kcbZl2VXw3/odtK','2026-02-14 17:37:27.96','2026-02-14 17:37:27.96') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmlmsftnq00043pl1hqfo936q','Vinicius','viniciusfloriani009@gmail.com','$2b$10$BcFrVfLcpyDAqaXF3kQp3uxtP5klpUC8OXljEhjpMc/rkY.zfNAcu','2026-02-14 20:47:42.566','2026-02-14 20:47:42.566') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmlnyju8p000c1mmacbc6gyin','Teste Model','teste.model.1771172792@gmail.com','$2b$10$0bnmQimVn5iW7P4KAPdn4eRKRgRsA6S0h1A.Adp4sT59dqRqnDhYq','2026-02-15 16:26:33.817','2026-02-15 16:26:33.817') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmlnyk7m7000g1mmazbvdii43','Teste Model','teste.model.1771172809@gmail.com','$2b$10$YLMUTztHievMxmUYMc48qOy5aqvPHEAvSID.2Bna6QRF3PRm/j2wq','2026-02-15 16:26:51.151','2026-02-15 16:26:51.151') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmlp9r68p000tcystx4n9bos6','Mileine','mileinebarcelos@gmail.com','$2b$10$gzrZ1d5bygER5YSz8BR4hOkR5tlQHb0SHMuhD.OLVWsYWMU0n/Ova','2026-02-16 14:27:57.913','2026-02-16 14:27:57.913') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmlpaaxo2000zcystpl6y918o','Bruno','bruno@dzigual.com.br','$2b$10$uwh9S36DmV3nNdv16slHjOw0d2a.jkTp4NZ0f8lFpCA0pyA66tA/W','2026-02-16 14:43:19.922','2026-02-16 14:43:19.922') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmlpmkxrq004mcystmun3b3qw','Juliano','julianofirme23@gmail.com','$2b$10$BzIjH5DydUhDd21x/h0gRe.Ejn8DQ/ZP6Nwscvz2O1RJ73nktBZ.y','2026-02-16 20:27:02.005','2026-02-16 20:27:02.005') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmltj8wbe00vacystivc4a1t9','Francisco Lucas','fcolucaslima14@gmail.com','$2b$10$Uz92scc9zFo8y0T4JvsyYeqnijln7AiK4rlEOemJwH0rBHRvQKdre','2026-02-19 14:04:46.106','2026-02-19 14:04:46.106') ON CONFLICT DO NOTHING;
 INSERT INTO "User" VALUES ('cmlu7srq000w9cystx9qq0kxa','matheus teste','florianimatheus97@gmail.com','$2b$10$UgxXMzgpZzXouEkvK35V1e3zhNCNdJQeCOeigTbRTSERtEZuLK64O','2026-02-20 01:32:04.056','2026-02-20 01:32:04.056') ON CONFLICT DO NOTHING;


-- ── Dados: MonthlyRecord ────────────────────────────────────
 INSERT INTO "MonthlyRecord" VALUES ('cmm29a2qu01o1cyst0f02nre0','cmlp9r68p000tcystx4n9bos6','2027-01',0,'2026-02-25 16:35:40.518','2026-02-25 16:35:40.518','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlpaayo90011cyst1adt8drx','cmlpaaxo2000zcystpl6y918o','2026-02',8000,'2026-02-16 14:43:21.225','2026-02-16 14:45:05.664','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmmoxyurp0041zhmancst8kqd','cmlmln63c0001gjmaaolbuyp9','2026-05',0,'2026-03-13 13:37:43.237','2026-03-15 18:47:35.309','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmm294y6v01npcyst80w0jhes','cmlp9r68p000tcystx4n9bos6','2025-01',0,'2026-02-25 16:31:41.334','2026-02-25 16:35:41.766','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlpmkz2a004ocystyb3xaxl2','cmlpmkxrq004mcystmun3b3qw','2026-02',0,'2026-02-16 20:27:03.682','2026-02-16 20:54:18.756','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmms3x27r0008t7ma9ki9akj3','cmlmln63c0001gjmaaolbuyp9','2026-06',0,'2026-03-15 18:47:35.799','2026-03-15 18:47:36.1','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmltj8xf700vccystt9a59w5u','cmltj8wbe00vacystivc4a1t9','2026-02',0,'2026-02-19 14:04:47.539','2026-02-19 14:04:47.539','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlmv38hi002oxomabn9bwr04','cmlmln63c0001gjmaaolbuyp9','2026-09',0,'2026-02-14 22:01:54.102','2026-02-14 22:01:54.102','[]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmms3x3fu0009t7mah0jqtsz0','cmlmln63c0001gjmaaolbuyp9','2026-07',0,'2026-03-15 18:47:37.386','2026-03-15 18:47:37.675','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmms3x43q000at7ma73d18wf6','cmlmln63c0001gjmaaolbuyp9','2026-08',0,'2026-03-15 18:47:38.246','2026-03-15 18:47:38.536','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmm28ykkf01mxcystcvx0hv0l','cmlp9r68p000tcystx4n9bos6','2026-01',0,'2026-02-25 16:26:43.743','2026-02-25 16:36:14.437','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlmlntby0003gjmam8j4hztp','cmlmln63c0001gjmaaolbuyp9','2026-02',7000,'2026-02-14 17:37:58.077','2026-03-15 18:55:30.664','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"d1090ed7-effb-4795-9e88-d74dc6aecc1f","name":"2X","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlp9r7hf000vcystyfgj41ip','cmlp9r68p000tcystx4n9bos6','2026-02',6000,'2026-02-16 14:27:59.523','2026-02-25 16:36:19.481','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmmf41chu000sxestjc29389g','cmlmsftnq00043pl1hqfo936q','2026-03',5500,'2026-03-06 16:29:55.458','2026-03-13 14:42:31.707','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2},{"id":"e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682","name":"Livro Asbea","multiplier":1,"hourlyRate":60}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlmn6ln0000fxoma27jzfpea','cmlmln63c0001gjmaaolbuyp9','2026-03',7000,'2026-02-14 18:20:34.188','2026-03-15 18:55:31.976','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2},{"id":"2edaea84-10e5-4f37-9798-06c9e9f87eca","name":"Modelo 3","multiplier":2,"hourlyRate":40}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlmsfumm00063pl1nv39irr2','cmlmsftnq00043pl1hqfo936q','2026-02',5500,'2026-02-14 20:47:43.821','2026-03-13 14:42:42.456','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2},{"id":"d0fe727a-8180-44bb-8cae-fe88082cbccb","name":"Livro Asbea","multiplier":1,"hourlyRate":60}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlmv39k1002pxomae8mhcvn5','cmlmln63c0001gjmaaolbuyp9','2026-04',7000,'2026-02-14 22:01:55.489','2026-03-15 18:47:33.467','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2},{"id":"2edaea84-10e5-4f37-9798-06c9e9f87eca","name":"Modelo 3","multiplier":2,"hourlyRate":40}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlu7ssq400wbcystmo5lyp0z','cmlu7srq000w9cystx9qq0kxa','2026-02',5000,'2026-02-20 01:32:05.356','2026-02-20 01:42:00.067','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":5}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmms3x5xn000bt7ma8c1tmctl','cmlmln63c0001gjmaaolbuyp9','2026-10',0,'2026-03-15 18:47:40.619','2026-03-15 18:47:40.908','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlmv2zo1002kxoma52jgwkaj','cmlmln63c0001gjmaaolbuyp9','2026-01',0,'2026-02-14 22:01:42.673','2026-03-15 18:47:44.761','[{"id":"default-standard","name":"CLT Padrão","multiplier":1.5},{"id":"default-100","name":"Hora Extra 100%","multiplier":2}]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlnyjutr000e1mmarsbzwubp','cmlnyju8p000c1mmacbc6gyin','2026-02',3200,'2026-02-15 16:26:34.575','2026-02-15 16:26:34.575','[]') ON CONFLICT DO NOTHING;
 INSERT INTO "MonthlyRecord" VALUES ('cmlnyk87h000i1mmayjffj4ym','cmlnyk7m7000g1mmazbvdii43','2026-02',3200,'2026-02-15 16:26:51.917','2026-02-15 16:26:51.917','[]') ON CONFLICT DO NOTHING;


-- ── Dados: DayEntry ─────────────────────────────────────────
 INSERT INTO "DayEntry" VALUES ('cmlnyjv65000f1mmak4gbrau0','cmlnyjutr000e1mmarsbzwubp','2026-02-15 00:00:00','08:00','12:00',4,'2026-02-15 16:26:35.021','2026-02-15 16:26:35.021','Projeto X','modelo-teste-123') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmlnyk8ko000j1mma8llm89dp','cmlnyk87h000i1mmayjffj4ym','2026-02-15 00:00:00','08:00','12:00',4,'2026-02-15 16:26:52.392','2026-02-15 16:26:52.392','Projeto X','modelo-teste-123') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl007zo7sto23owcb1','cmlmlntby0003gjmam8j4hztp','2026-02-02 00:00:00','08:00','09:00',1,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Lever','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0080o7stw6qx7o1p','cmlmlntby0003gjmam8j4hztp','2026-02-03 00:00:00','20:00','21:00',1,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Lever','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0081o7st0b90yr79','cmlmlntby0003gjmam8j4hztp','2026-02-07 00:00:00','19:00','20:00',1,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Lever','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0082o7stkyj6n9t2','cmlmlntby0003gjmam8j4hztp','2026-02-09 00:00:00','20:00','23:00',3,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Lever','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0083o7st8a0rk64x','cmlmlntby0003gjmam8j4hztp','2026-02-10 00:00:00','08:00','10:00',2,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Lever','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0084o7stu5iv113z','cmlmlntby0003gjmam8j4hztp','2026-02-12 00:00:00','18:00','22:00',4,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Lever','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0a7i1002wo7stkl5z0q9m','cmmf41chu000sxestjc29389g','2026-03-07 00:00:00','09:00','10:00',1,'2026-03-13 14:42:32.185','2026-03-13 14:42:32.185','Livro AsBea','e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0a7i1002xo7st74z695p6','cmmf41chu000sxestjc29389g','2026-03-07 00:00:00','14:00','15:00',1,'2026-03-13 14:42:32.185','2026-03-13 14:42:32.185','Livro AsBea','e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0a7i1002yo7st0vz71vyz','cmmf41chu000sxestjc29389g','2026-03-08 00:00:00','22:00','23:00',1,'2026-03-13 14:42:32.185','2026-03-13 14:42:32.185','Livro AsBea','e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0a7i1002zo7stbs8ji8ms','cmmf41chu000sxestjc29389g','2026-03-09 00:00:00','22:00','23:00',1,'2026-03-13 14:42:32.185','2026-03-13 14:42:32.185','Livro AsBea','e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmlpad88x0019cystdo0w9yhk','cmlpaayo90011cyst1adt8drx','2026-02-12 00:00:00','18:00','22:00',4,'2026-02-16 14:45:06.945','2026-02-16 14:45:06.945','Catalogo Pointer','default-100') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0a7i10030o7stlv47eon9','cmmf41chu000sxestjc29389g','2026-03-10 00:00:00','22:00','23:00',1,'2026-03-13 14:42:32.185','2026-03-13 14:42:32.185','Livro AsBea','e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0a7i10031o7sto2dtnnrr','cmmf41chu000sxestjc29389g','2026-03-11 00:00:00','09:00','10:00',1,'2026-03-13 14:42:32.185','2026-03-13 14:42:32.185','Livro AsBea','e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft40033o7st7p8yh92t','cmlmsfumm00063pl1nv39irr2','2026-01-06 00:00:00','18:00','23:00',5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Livro AsBea','d0fe727a-8180-44bb-8cae-fe88082cbccb') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft40034o7st5m59ymhv','cmlmsfumm00063pl1nv39irr2','2026-01-22 00:00:00','18:00','19:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Livro AsBea','d0fe727a-8180-44bb-8cae-fe88082cbccb') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft40035o7stx0uxpgsu','cmlmsfumm00063pl1nv39irr2','2026-01-23 00:00:00','18:00','19:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Livro AsBea','d0fe727a-8180-44bb-8cae-fe88082cbccb') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft40036o7st6qmxklu4','cmlmsfumm00063pl1nv39irr2','2026-01-30 00:00:00','18:00','19:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Livro AsBea','d0fe727a-8180-44bb-8cae-fe88082cbccb') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft40037o7stfp3njex0','cmlmsfumm00063pl1nv39irr2','2026-02-02 00:00:00','18:00','19:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft40038o7stigymuxjb','cmlmsfumm00063pl1nv39irr2','2026-02-03 00:00:00','18:00','20:00',2,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft40039o7sth3zloqqg','cmlmsfumm00063pl1nv39irr2','2026-02-04 00:00:00','18:00','22:30',4.5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-100') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft4003ao7stp5tgnsp3','cmlmsfumm00063pl1nv39irr2','2026-02-05 00:00:00','18:00','21:30',3.5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft4003bo7stbvc2r6w9','cmlmsfumm00063pl1nv39irr2','2026-02-06 00:00:00','18:00','19:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003co7statdhtdqw','cmlmsfumm00063pl1nv39irr2','2026-02-07 00:00:00','10:00','18:30',8.5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-100') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003do7st7klgnfui','cmlmsfumm00063pl1nv39irr2','2026-02-07 00:00:00','18:00','19:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Livro AsBea','d0fe727a-8180-44bb-8cae-fe88082cbccb') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003eo7st05porbvl','cmlmsfumm00063pl1nv39irr2','2026-02-08 00:00:00','08:30','19:30',11,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-100') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003fo7st5rd4q3y8','cmlmsfumm00063pl1nv39irr2','2026-02-09 00:00:00','18:00','20:00',2,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003go7sto5v18q6e','cmlmsfumm00063pl1nv39irr2','2026-02-10 00:00:00','18:00','20:00',2,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003ho7st7e9vo2fn','cmlmsfumm00063pl1nv39irr2','2026-02-11 00:00:00','18:00','21:00',3,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003io7stagyzk1ag','cmlmsfumm00063pl1nv39irr2','2026-02-12 00:00:00','18:00','23:00',5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003jo7st6g882hth','cmlmsfumm00063pl1nv39irr2','2026-02-13 00:00:00','18:00','23:00',5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003ko7stiuwlxcop','cmlmsfumm00063pl1nv39irr2','2026-02-14 00:00:00','10:00','20:00',10,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003lo7sthl7g17wl','cmlmsfumm00063pl1nv39irr2','2026-02-15 00:00:00','09:00','23:00',14,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003mo7stw1yvfkby','cmlmsfumm00063pl1nv39irr2','2026-02-16 00:00:00','18:00','22:30',4.5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003no7stjwv3cy35','cmlmsfumm00063pl1nv39irr2','2026-02-17 00:00:00','18:00','22:30',4.5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003oo7styidprkzt','cmlmsfumm00063pl1nv39irr2','2026-02-18 00:00:00','18:00','01:30',7.5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003po7stqn0khm6s','cmlmsfumm00063pl1nv39irr2','2026-02-19 00:00:00','18:00','23:00',5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003qo7stbr3phb3y','cmlmsfumm00063pl1nv39irr2','2026-02-20 00:00:00','18:00','19:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Livro AsBea','d0fe727a-8180-44bb-8cae-fe88082cbccb') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003ro7st2opfnss2','cmlmsfumm00063pl1nv39irr2','2026-02-20 00:00:00','18:00','23:00',5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0085o7st0ru86zhp','cmlmlntby0003gjmam8j4hztp','2026-02-13 00:00:00','18:00','20:00',2,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0086o7stitqkh0gn','cmlmlntby0003gjmam8j4hztp','2026-02-14 00:00:00','09:30','19:00',9.5,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0087o7stamvcor0u','cmlmlntby0003gjmam8j4hztp','2026-02-15 00:00:00','09:00','21:00',12,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0088o7stix10qj48','cmlmlntby0003gjmam8j4hztp','2026-02-16 00:00:00','18:00','22:50',4.83333333333333,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl0089o7stpb247zyd','cmlmlntby0003gjmam8j4hztp','2026-02-17 00:00:00','18:00','22:50',4.83333333333333,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008ao7stxgu8l60h','cmlmlntby0003gjmam8j4hztp','2026-02-19 00:00:00','18:00','00:30',6.5,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008bo7stgmcirvvh','cmlmlntby0003gjmam8j4hztp','2026-02-19 00:00:00','12:00','13:00',1,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Lever','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmlpnk1pz004rcystvuk5nw3y','cmlpmkz2a004ocystyb3xaxl2','2026-02-16 00:00:00','12:00','18:00',6,'2026-02-16 20:54:20.087','2026-02-16 20:54:20.087','Teste','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003so7stn9n7tykg','cmlmsfumm00063pl1nv39irr2','2026-02-21 00:00:00','08:30','00:00',15.5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003to7stk5bmby23','cmlmsfumm00063pl1nv39irr2','2026-02-22 00:00:00','09:00','23:00',14,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft5003uo7stnnmjk9qp','cmlmsfumm00063pl1nv39irr2','2026-02-23 00:00:00','18:00','00:00',6,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft7003vo7stmyk8f1l5','cmlmsfumm00063pl1nv39irr2','2026-02-24 00:00:00','18:00','20:00',2,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft7003wo7sts2avig4f','cmlmsfumm00063pl1nv39irr2','2026-02-25 00:00:00','18:00','00:00',6,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft7003xo7stkruxbvrt','cmlmsfumm00063pl1nv39irr2','2026-02-26 00:00:00','09:00','10:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Livro AsBea','d0fe727a-8180-44bb-8cae-fe88082cbccb') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft7003yo7stui2f2sm4','cmlmsfumm00063pl1nv39irr2','2026-02-27 00:00:00','18:00','19:00',1,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Livro AsBea','d0fe727a-8180-44bb-8cae-fe88082cbccb') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft7003zo7stnv2tepha','cmlmsfumm00063pl1nv39irr2','2026-02-27 00:00:00','18:00','21:30',3.5,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft70040o7stsdwvap4d','cmlmsfumm00063pl1nv39irr2','2026-02-28 00:00:00','13:00','15:00',2,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft70041o7sts411i6e5','cmlmsfumm00063pl1nv39irr2','2026-03-01 00:00:00','15:00','22:00',7,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmmp0aft70042o7st73jfytrt','cmlmsfumm00063pl1nv39irr2','2026-03-02 00:00:00','18:00','00:00',6,'2026-03-13 14:42:42.952','2026-03-13 14:42:42.952','Feira','default-standard') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008co7strg8esgic','cmlmlntby0003gjmam8j4hztp','2026-02-20 00:00:00','18:00','23:00',5,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008do7st4d5lwfeb','cmlmlntby0003gjmam8j4hztp','2026-02-21 00:00:00','09:00','22:00',13,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008eo7st73bji0o5','cmlmlntby0003gjmam8j4hztp','2026-02-22 00:00:00','10:00','21:00',11,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008fo7stebwlsd7h','cmlmlntby0003gjmam8j4hztp','2026-02-23 00:00:00','18:00','22:00',4,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008go7st1boodhxz','cmlmlntby0003gjmam8j4hztp','2026-02-24 00:00:00','18:00','22:30',4.5,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008ho7st0bn0bfdu','cmlmlntby0003gjmam8j4hztp','2026-02-26 00:00:00','18:00','23:00',5,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008io7stux58cki1','cmlmlntby0003gjmam8j4hztp','2026-02-27 00:00:00','18:00','22:30',4.5,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmms478zl008jo7stwivhyl0p','cmlmlntby0003gjmam8j4hztp','2026-02-28 00:00:00','09:00','21:00',12,'2026-03-15 18:55:31.137','2026-03-15 18:55:31.137','Portobello','d1090ed7-effb-4795-9e88-d74dc6aecc1f') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmlu85jzc00whcyst8pyuny26','cmlu7ssq400wbcystmo5lyp0z','2026-02-19 00:00:00','18:00','23:00',5,'2026-02-20 01:42:00.552','2026-02-20 01:42:00.552','PBA','default-100') ON CONFLICT DO NOTHING;
 INSERT INTO "DayEntry" VALUES ('cmm29ax6201o7cystihl7c5wn','cmlp9r7hf000vcystyfgj41ip','2026-02-16 00:00:00','18:00','21:30',3.5,'2026-02-25 16:36:19.946','2026-02-25 16:36:19.946','Dz','default-100') ON CONFLICT DO NOTHING;


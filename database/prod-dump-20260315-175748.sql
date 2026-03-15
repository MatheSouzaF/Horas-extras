--
-- PostgreSQL database dump
--

\restrict giiQulsmeBkQpYn1eviZtMQoYG813Vxr7PetBCeqdt8YsR8yBaXSlRcWUZ5rOwd

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: DayEntry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DayEntry" (
    id text NOT NULL,
    "monthlyRecordId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "workedHours" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "projectWorked" text DEFAULT ''::text NOT NULL,
    "calculationModelId" text DEFAULT ''::text NOT NULL
);


--
-- Name: MonthlyRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MonthlyRecord" (
    id text NOT NULL,
    "userId" text NOT NULL,
    month text NOT NULL,
    salary double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "modelsJson" jsonb
);


--
-- Name: RefreshSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefreshSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "deviceName" text,
    "userAgent" text,
    "ipAddress" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "revokedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: DayEntry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DayEntry" (id, "monthlyRecordId", date, "startTime", "endTime", "workedHours", "createdAt", "updatedAt", "projectWorked", "calculationModelId") FROM stdin;
cmlnyjv65000f1mmak4gbrau0	cmlnyjutr000e1mmarsbzwubp	2026-02-15 00:00:00	08:00	12:00	4	2026-02-15 16:26:35.021	2026-02-15 16:26:35.021	Projeto X	modelo-teste-123
cmlnyk8ko000j1mma8llm89dp	cmlnyk87h000i1mmayjffj4ym	2026-02-15 00:00:00	08:00	12:00	4	2026-02-15 16:26:52.392	2026-02-15 16:26:52.392	Projeto X	modelo-teste-123
cmmp0a7i1002wo7stkl5z0q9m	cmmf41chu000sxestjc29389g	2026-03-07 00:00:00	09:00	10:00	1	2026-03-13 14:42:32.185	2026-03-13 14:42:32.185	Livro AsBea	e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682
cmmp0a7i1002xo7st74z695p6	cmmf41chu000sxestjc29389g	2026-03-07 00:00:00	14:00	15:00	1	2026-03-13 14:42:32.185	2026-03-13 14:42:32.185	Livro AsBea	e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682
cmmp0a7i1002yo7st0vz71vyz	cmmf41chu000sxestjc29389g	2026-03-08 00:00:00	22:00	23:00	1	2026-03-13 14:42:32.185	2026-03-13 14:42:32.185	Livro AsBea	e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682
cmmp0a7i1002zo7stbs8ji8ms	cmmf41chu000sxestjc29389g	2026-03-09 00:00:00	22:00	23:00	1	2026-03-13 14:42:32.185	2026-03-13 14:42:32.185	Livro AsBea	e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682
cmlpad88x0019cystdo0w9yhk	cmlpaayo90011cyst1adt8drx	2026-02-12 00:00:00	18:00	22:00	4	2026-02-16 14:45:06.945	2026-02-16 14:45:06.945	Catalogo Pointer	default-100
cmmp0a7i10030o7stlv47eon9	cmmf41chu000sxestjc29389g	2026-03-10 00:00:00	22:00	23:00	1	2026-03-13 14:42:32.185	2026-03-13 14:42:32.185	Livro AsBea	e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682
cmmp0a7i10031o7sto2dtnnrr	cmmf41chu000sxestjc29389g	2026-03-11 00:00:00	09:00	10:00	1	2026-03-13 14:42:32.185	2026-03-13 14:42:32.185	Livro AsBea	e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682
cmmp0aft40033o7st7p8yh92t	cmlmsfumm00063pl1nv39irr2	2026-01-06 00:00:00	18:00	23:00	5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Livro AsBea	d0fe727a-8180-44bb-8cae-fe88082cbccb
cmmp0aft40034o7st5m59ymhv	cmlmsfumm00063pl1nv39irr2	2026-01-22 00:00:00	18:00	19:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Livro AsBea	d0fe727a-8180-44bb-8cae-fe88082cbccb
cmmp0aft40035o7stx0uxpgsu	cmlmsfumm00063pl1nv39irr2	2026-01-23 00:00:00	18:00	19:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Livro AsBea	d0fe727a-8180-44bb-8cae-fe88082cbccb
cmmp0aft40036o7st6qmxklu4	cmlmsfumm00063pl1nv39irr2	2026-01-30 00:00:00	18:00	19:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Livro AsBea	d0fe727a-8180-44bb-8cae-fe88082cbccb
cmmp0aft40037o7stfp3njex0	cmlmsfumm00063pl1nv39irr2	2026-02-02 00:00:00	18:00	19:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft40038o7stigymuxjb	cmlmsfumm00063pl1nv39irr2	2026-02-03 00:00:00	18:00	20:00	2	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft40039o7sth3zloqqg	cmlmsfumm00063pl1nv39irr2	2026-02-04 00:00:00	18:00	22:30	4.5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-100
cmmp0aft4003ao7stp5tgnsp3	cmlmsfumm00063pl1nv39irr2	2026-02-05 00:00:00	18:00	21:30	3.5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft4003bo7stbvc2r6w9	cmlmsfumm00063pl1nv39irr2	2026-02-06 00:00:00	18:00	19:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003co7statdhtdqw	cmlmsfumm00063pl1nv39irr2	2026-02-07 00:00:00	10:00	18:30	8.5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-100
cmmp0aft5003do7st7klgnfui	cmlmsfumm00063pl1nv39irr2	2026-02-07 00:00:00	18:00	19:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Livro AsBea	d0fe727a-8180-44bb-8cae-fe88082cbccb
cmmp0aft5003eo7st05porbvl	cmlmsfumm00063pl1nv39irr2	2026-02-08 00:00:00	08:30	19:30	11	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-100
cmmp0aft5003fo7st5rd4q3y8	cmlmsfumm00063pl1nv39irr2	2026-02-09 00:00:00	18:00	20:00	2	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003go7sto5v18q6e	cmlmsfumm00063pl1nv39irr2	2026-02-10 00:00:00	18:00	20:00	2	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003ho7st7e9vo2fn	cmlmsfumm00063pl1nv39irr2	2026-02-11 00:00:00	18:00	21:00	3	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003io7stagyzk1ag	cmlmsfumm00063pl1nv39irr2	2026-02-12 00:00:00	18:00	23:00	5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003jo7st6g882hth	cmlmsfumm00063pl1nv39irr2	2026-02-13 00:00:00	18:00	23:00	5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003ko7stiuwlxcop	cmlmsfumm00063pl1nv39irr2	2026-02-14 00:00:00	10:00	20:00	10	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003lo7sthl7g17wl	cmlmsfumm00063pl1nv39irr2	2026-02-15 00:00:00	09:00	23:00	14	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003mo7stw1yvfkby	cmlmsfumm00063pl1nv39irr2	2026-02-16 00:00:00	18:00	22:30	4.5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003no7stjwv3cy35	cmlmsfumm00063pl1nv39irr2	2026-02-17 00:00:00	18:00	22:30	4.5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003oo7styidprkzt	cmlmsfumm00063pl1nv39irr2	2026-02-18 00:00:00	18:00	01:30	7.5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003po7stqn0khm6s	cmlmsfumm00063pl1nv39irr2	2026-02-19 00:00:00	18:00	23:00	5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003qo7stbr3phb3y	cmlmsfumm00063pl1nv39irr2	2026-02-20 00:00:00	18:00	19:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Livro AsBea	d0fe727a-8180-44bb-8cae-fe88082cbccb
cmmp0aft5003ro7st2opfnss2	cmlmsfumm00063pl1nv39irr2	2026-02-20 00:00:00	18:00	23:00	5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmlpnk1pz004rcystvuk5nw3y	cmlpmkz2a004ocystyb3xaxl2	2026-02-16 00:00:00	12:00	18:00	6	2026-02-16 20:54:20.087	2026-02-16 20:54:20.087	Teste	default-standard
cmmp0aft5003so7stn9n7tykg	cmlmsfumm00063pl1nv39irr2	2026-02-21 00:00:00	08:30	00:00	15.5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003to7stk5bmby23	cmlmsfumm00063pl1nv39irr2	2026-02-22 00:00:00	09:00	23:00	14	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft5003uo7stnnmjk9qp	cmlmsfumm00063pl1nv39irr2	2026-02-23 00:00:00	18:00	00:00	6	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft7003vo7stmyk8f1l5	cmlmsfumm00063pl1nv39irr2	2026-02-24 00:00:00	18:00	20:00	2	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft7003wo7sts2avig4f	cmlmsfumm00063pl1nv39irr2	2026-02-25 00:00:00	18:00	00:00	6	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft7003xo7stkruxbvrt	cmlmsfumm00063pl1nv39irr2	2026-02-26 00:00:00	09:00	10:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Livro AsBea	d0fe727a-8180-44bb-8cae-fe88082cbccb
cmmp0aft7003yo7stui2f2sm4	cmlmsfumm00063pl1nv39irr2	2026-02-27 00:00:00	18:00	19:00	1	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Livro AsBea	d0fe727a-8180-44bb-8cae-fe88082cbccb
cmmp0aft7003zo7stnv2tepha	cmlmsfumm00063pl1nv39irr2	2026-02-27 00:00:00	18:00	21:30	3.5	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft70040o7stsdwvap4d	cmlmsfumm00063pl1nv39irr2	2026-02-28 00:00:00	13:00	15:00	2	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft70041o7sts411i6e5	cmlmsfumm00063pl1nv39irr2	2026-03-01 00:00:00	15:00	22:00	7	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmmp0aft70042o7st73jfytrt	cmlmsfumm00063pl1nv39irr2	2026-03-02 00:00:00	18:00	00:00	6	2026-03-13 14:42:42.952	2026-03-13 14:42:42.952	Feira	default-standard
cmlu85jzc00whcyst8pyuny26	cmlu7ssq400wbcystmo5lyp0z	2026-02-19 00:00:00	18:00	23:00	5	2026-02-20 01:42:00.552	2026-02-20 01:42:00.552	PBA	default-100
cmm29ax6201o7cystihl7c5wn	cmlp9r7hf000vcystyfgj41ip	2026-02-16 00:00:00	18:00	21:30	3.5	2026-02-25 16:36:19.946	2026-02-25 16:36:19.946	Dz	default-100
cmms88fmb0027anstexajzp0u	cmlmlntby0003gjmam8j4hztp	2026-02-02 00:00:00	08:00	09:00	1	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Lever	default-100
cmms88fmb0028anst88z0puhi	cmlmlntby0003gjmam8j4hztp	2026-02-03 00:00:00	20:00	21:00	1	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Lever	default-100
cmms88fmb0029anstestfcvco	cmlmlntby0003gjmam8j4hztp	2026-02-07 00:00:00	19:00	20:00	1	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Lever	default-100
cmms88fmb002aanst43x2anji	cmlmlntby0003gjmam8j4hztp	2026-02-09 00:00:00	20:00	23:00	3	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Lever	default-100
cmms88fmb002banst6rx4ub11	cmlmlntby0003gjmam8j4hztp	2026-02-10 00:00:00	08:00	10:00	2	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Lever	default-100
cmms88fmb002canstog5nv22m	cmlmlntby0003gjmam8j4hztp	2026-02-12 00:00:00	18:00	22:00	4	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Lever	default-100
cmms88fmb002danst648gdwrq	cmlmlntby0003gjmam8j4hztp	2026-02-13 00:00:00	18:00	20:00	2	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmb002eanst6mwha0iy	cmlmlntby0003gjmam8j4hztp	2026-02-14 00:00:00	09:30	19:00	9.5	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmb002fanstbqu5umdc	cmlmlntby0003gjmam8j4hztp	2026-02-15 00:00:00	09:00	21:00	12	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmb002ganst1lqjcvxf	cmlmlntby0003gjmam8j4hztp	2026-02-16 00:00:00	18:00	22:50	4.833333333333333	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmb002hanstfz295dmj	cmlmlntby0003gjmam8j4hztp	2026-02-17 00:00:00	18:00	22:50	4.833333333333333	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmb002ianstf2nmgujk	cmlmlntby0003gjmam8j4hztp	2026-02-19 00:00:00	18:00	00:30	6.5	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmc002janst32zuk6vg	cmlmlntby0003gjmam8j4hztp	2026-02-19 00:00:00	12:00	13:00	1	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Lever	default-100
cmms88fmc002kanstv4d70fjt	cmlmlntby0003gjmam8j4hztp	2026-02-20 00:00:00	18:00	23:00	5	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmc002lanstrbf5tud7	cmlmlntby0003gjmam8j4hztp	2026-02-21 00:00:00	09:00	22:00	13	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmc002manst2s1383dr	cmlmlntby0003gjmam8j4hztp	2026-02-22 00:00:00	10:00	21:00	11	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmc002nanstknznuw8k	cmlmlntby0003gjmam8j4hztp	2026-02-23 00:00:00	18:00	22:00	4	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmc002oansttrdwhvhy	cmlmlntby0003gjmam8j4hztp	2026-02-24 00:00:00	18:00	22:30	4.5	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmc002panstsb2kzlta	cmlmlntby0003gjmam8j4hztp	2026-02-26 00:00:00	18:00	23:00	5	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmc002qanstsqlekb8h	cmlmlntby0003gjmam8j4hztp	2026-02-27 00:00:00	18:00	22:30	4.5	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms88fmc002ranste4ktoxtp	cmlmlntby0003gjmam8j4hztp	2026-02-28 00:00:00	09:00	21:00	12	2026-03-15 20:48:24.851	2026-03-15 20:48:24.851	Portobello	default-100
cmms8j6kc007manstpved4waq	cmlmn6ln0000fxoma27jzfpea	2026-03-01 00:00:00	09:00	18:00	9	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007nanstgk4jzk5y	cmlmn6ln0000fxoma27jzfpea	2026-03-02 00:00:00	18:00	22:00	4	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007oansthkgfye5g	cmlmn6ln0000fxoma27jzfpea	2026-03-03 00:00:00	18:00	22:00	4	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007panst1cf91c4s	cmlmn6ln0000fxoma27jzfpea	2026-03-04 00:00:00	18:00	19:00	1	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007qanst2psforzm	cmlmn6ln0000fxoma27jzfpea	2026-03-05 00:00:00	18:00	22:00	4	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-standard
cmms8j6kc007ranstwalbz3qc	cmlmn6ln0000fxoma27jzfpea	2026-03-06 00:00:00	18:00	23:00	5	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007sanstv78ffs71	cmlmn6ln0000fxoma27jzfpea	2026-03-07 00:00:00	11:00	19:00	8	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007tanstxsout0ww	cmlmn6ln0000fxoma27jzfpea	2026-03-09 00:00:00	18:00	23:00	5	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007uanstc68x7r35	cmlmn6ln0000fxoma27jzfpea	2026-03-10 00:00:00	18:00	23:00	5	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007vanst39ltwb72	cmlmn6ln0000fxoma27jzfpea	2026-03-12 00:00:00	18:00	22:00	4	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007wanstg1bg7ax2	cmlmn6ln0000fxoma27jzfpea	2026-03-13 00:00:00	18:00	23:00	5	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007xanstish56bnz	cmlmn6ln0000fxoma27jzfpea	2026-03-14 00:00:00	09:30	20:00	10.5	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
cmms8j6kc007yanstiynrnahb	cmlmn6ln0000fxoma27jzfpea	2026-03-15 00:00:00	14:00	20:00	6	2026-03-15 20:56:46.332	2026-03-15 20:56:46.332	Portobello	default-100
\.


--
-- Data for Name: MonthlyRecord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MonthlyRecord" (id, "userId", month, salary, "createdAt", "updatedAt", "modelsJson") FROM stdin;
cmm29a2qu01o1cyst0f02nre0	cmlp9r68p000tcystx4n9bos6	2027-01	0	2026-02-25 16:35:40.518	2026-02-25 16:35:40.518	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmlpaayo90011cyst1adt8drx	cmlpaaxo2000zcystpl6y918o	2026-02	8000	2026-02-16 14:43:21.225	2026-02-16 14:45:05.664	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmmoxyurp0041zhmancst8kqd	cmlmln63c0001gjmaaolbuyp9	2026-05	0	2026-03-13 13:37:43.237	2026-03-15 18:47:35.309	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmm294y6v01npcyst80w0jhes	cmlp9r68p000tcystx4n9bos6	2025-01	0	2026-02-25 16:31:41.334	2026-02-25 16:35:41.766	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmlpmkz2a004ocystyb3xaxl2	cmlpmkxrq004mcystmun3b3qw	2026-02	0	2026-02-16 20:27:03.682	2026-02-16 20:54:18.756	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmms3x27r0008t7ma9ki9akj3	cmlmln63c0001gjmaaolbuyp9	2026-06	0	2026-03-15 18:47:35.799	2026-03-15 18:47:36.1	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmltj8xf700vccystt9a59w5u	cmltj8wbe00vacystivc4a1t9	2026-02	0	2026-02-19 14:04:47.539	2026-02-19 14:04:47.539	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmlmv38hi002oxomabn9bwr04	cmlmln63c0001gjmaaolbuyp9	2026-09	0	2026-02-14 22:01:54.102	2026-02-14 22:01:54.102	[]
cmms3x3fu0009t7mah0jqtsz0	cmlmln63c0001gjmaaolbuyp9	2026-07	0	2026-03-15 18:47:37.386	2026-03-15 18:47:37.675	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmms3x43q000at7ma73d18wf6	cmlmln63c0001gjmaaolbuyp9	2026-08	0	2026-03-15 18:47:38.246	2026-03-15 18:47:38.536	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmm28ykkf01mxcystcvx0hv0l	cmlp9r68p000tcystx4n9bos6	2026-01	0	2026-02-25 16:26:43.743	2026-02-25 16:36:14.437	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmlp9r7hf000vcystyfgj41ip	cmlp9r68p000tcystx4n9bos6	2026-02	6000	2026-02-16 14:27:59.523	2026-02-25 16:36:19.481	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmmf41chu000sxestjc29389g	cmlmsftnq00043pl1hqfo936q	2026-03	5500	2026-03-06 16:29:55.458	2026-03-13 14:42:31.707	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}, {"id": "e34e3bf6-06a2-4ae0-8f16-5ec19fdc4682", "name": "Livro Asbea", "hourlyRate": 60, "multiplier": 1}]
cmlmsfumm00063pl1nv39irr2	cmlmsftnq00043pl1hqfo936q	2026-02	5500	2026-02-14 20:47:43.821	2026-03-13 14:42:42.456	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}, {"id": "d0fe727a-8180-44bb-8cae-fe88082cbccb", "name": "Livro Asbea", "hourlyRate": 60, "multiplier": 1}]
cmlmv39k1002pxomae8mhcvn5	cmlmln63c0001gjmaaolbuyp9	2026-04	7000	2026-02-14 22:01:55.489	2026-03-15 18:47:33.467	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}, {"id": "2edaea84-10e5-4f37-9798-06c9e9f87eca", "name": "Modelo 3", "hourlyRate": 40, "multiplier": 2}]
cmlu7ssq400wbcystmo5lyp0z	cmlu7srq000w9cystx9qq0kxa	2026-02	5000	2026-02-20 01:32:05.356	2026-02-20 01:42:00.067	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 5}]
cmms3x5xn000bt7ma8c1tmctl	cmlmln63c0001gjmaaolbuyp9	2026-10	0	2026-03-15 18:47:40.619	2026-03-15 18:47:40.908	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmlnyjutr000e1mmarsbzwubp	cmlnyju8p000c1mmacbc6gyin	2026-02	3200	2026-02-15 16:26:34.575	2026-02-15 16:26:34.575	[]
cmlnyk87h000i1mmayjffj4ym	cmlnyk7m7000g1mmazbvdii43	2026-02	3200	2026-02-15 16:26:51.917	2026-02-15 16:26:51.917	[]
cmlmlntby0003gjmam8j4hztp	cmlmln63c0001gjmaaolbuyp9	2026-02	7000	2026-02-14 17:37:58.077	2026-03-15 20:48:24.849	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}, {"id": "2edaea84-10e5-4f37-9798-06c9e9f87eca", "name": "Modelo 3", "hourlyRate": 40, "multiplier": 2}]
cmlmv2zo1002kxoma52jgwkaj	cmlmln63c0001gjmaaolbuyp9	2026-01	0	2026-02-14 22:01:42.673	2026-03-15 20:40:42.833	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}]
cmlmn6ln0000fxoma27jzfpea	cmlmln63c0001gjmaaolbuyp9	2026-03	7000	2026-02-14 18:20:34.188	2026-03-15 20:56:46.322	[{"id": "default-standard", "name": "CLT Padrão", "multiplier": 1.5}, {"id": "default-100", "name": "Hora Extra 100%", "multiplier": 2}, {"id": "2edaea84-10e5-4f37-9798-06c9e9f87eca", "name": "Modelo 3", "multiplier": 2}]
\.


--
-- Data for Name: RefreshSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RefreshSession" (id, "userId", "tokenHash", "deviceName", "userAgent", "ipAddress", "expiresAt", "lastUsedAt", "revokedAt", "createdAt", "updatedAt") FROM stdin;
cmlmlooz20007gjmahguqo0b4	cmlmln63c0001gjmaaolbuyp9	5e7981fa03b7ed4bbd5ca3c36f1051c90dc2b44b4637430ccd87adf63ea83e0f	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::1	2026-02-21 22:01:17	2026-02-14 22:01:17.261	\N	2026-02-14 17:38:39.086	2026-02-14 22:01:17.262
cmlmln6fa0002gjmakj5skz9z	cmlmln63c0001gjmaaolbuyp9	8325afcd5819a48bd7907a9034be15f9a84b801a9debbfa2a8ea81a4c6d0c3eb	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::1	2026-02-21 17:37:28	2026-02-14 17:37:28.555	2026-02-14 17:38:23.769	2026-02-14 17:37:28.39	2026-02-14 17:38:23.773
cmlo4lteb000fabst0xze40js	cmlmln63c0001gjmaaolbuyp9	72b9606002362d02e3d91c762ed059cd7995c069a7982e121dafeac7cc0e3337	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-22 19:16:03	2026-02-15 19:16:03.859	\N	2026-02-15 19:16:03.731	2026-02-15 19:16:03.859
cmlmv2yw8002jxomahtrciwo5	cmlmln63c0001gjmaaolbuyp9	978e1815da480cd36ff7005d981c29d802f40e73387185162298870df5b0e014	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::1	2026-02-21 22:45:52	2026-02-14 22:45:52.329	\N	2026-02-14 22:01:41.672	2026-02-14 22:45:52.329
cmlofxmke006apast9myfjunl	cmlmln63c0001gjmaaolbuyp9	4062688dfca8a6b11e6b1e65483942ee5d3500b566cd6609e1f18a5ca9b46632	Web-Linux armv81	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36	::ffff:127.0.0.1	2026-02-23 00:33:10	2026-02-16 00:33:10.668	\N	2026-02-16 00:33:10.526	2026-02-16 00:33:10.668
cmlns0hzl0000y1p2cms3czlh	cmlmln63c0001gjmaaolbuyp9	df69feaf7ae931ee2213e0df83f508e90ac712c9564af644b15a3f993e16ed56	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	::ffff:127.0.0.1	2026-02-22 16:10:24	2026-02-15 16:10:24.841	\N	2026-02-15 13:23:33.777	2026-02-15 16:10:24.843
cmlo0lg6w0000sdst5v3n4z9i	cmlmsftnq00043pl1hqfo936q	7a178106fc226575da364f571f9f9da561426b86ff1b37b902b4aa58077a36e2	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-23 01:31:20	2026-02-16 01:31:20.13	\N	2026-02-15 17:23:48.152	2026-02-16 01:31:20.131
cmlmsdm9s00003pl1d3u316gn	cmlmln63c0001gjmaaolbuyp9	d0e979587c07329b6421cb589a8b0138991915d09740fb6dc39836d7c8c87787	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-21 20:45:59	2026-02-14 20:45:59.804	2026-02-14 20:46:08.877	2026-02-14 20:45:59.68	2026-02-14 20:46:08.88
cmlmsftwy00053pl10npltfj0	cmlmsftnq00043pl1hqfo936q	fca13088968544c2b84906e1076b90398dcbc73b4f54d93c3486f7068a97c725	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-21 20:47:43	2026-02-14 20:47:43.017	\N	2026-02-14 20:47:42.898	2026-02-14 20:47:43.017
cmlny11b10000ipma1tpnnaxl	cmlmln63c0001gjmaaolbuyp9	573cc3b07f35b7bac17c807442693fdab795d00478e9e0fbfdbac26522930e83	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::1	2026-02-22 21:03:43	2026-02-15 21:03:43.057	\N	2026-02-15 16:11:56.509	2026-02-15 21:03:43.064
cmlnyjuk2000d1mmatfpndbki	cmlnyju8p000c1mmacbc6gyin	937c47e13d0b19138e1b4d061dcc3759ae29e08a15b0e2149831e7ee855a9e62	\N	curl/8.5.0	::1	2026-02-22 16:26:34	2026-02-15 16:26:34.375	\N	2026-02-15 16:26:34.226	2026-02-15 16:26:34.379
cmlnyk7xn000h1mma2yfymucj	cmlnyk7m7000g1mmazbvdii43	43452bad3917183c3769101cda083b94401a6d6991a4acf504977f632e024b2d	\N	curl/8.5.0	::1	2026-02-22 16:26:51	2026-02-15 16:26:51.721	\N	2026-02-15 16:26:51.563	2026-02-15 16:26:51.721
cmlp9ovzr0000cyst8920eunt	cmlmln63c0001gjmaaolbuyp9	9c42fb20f43a4a55e89310cead07b025b6dc48692a190b4014133a63e5ab5ba8	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-23 14:26:11	2026-02-16 14:26:11.451	\N	2026-02-16 14:26:11.318	2026-02-16 14:26:11.457
cmlo4luc2000habstdazz15gc	cmlmln63c0001gjmaaolbuyp9	497ea1aa069c85a73033530e89b4250aac249fcc4579a317187fa77ab01546bf	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-23 12:47:14	2026-02-16 12:47:14.791	\N	2026-02-15 19:16:04.946	2026-02-16 12:47:14.791
cmlr419nr00ducystpw4iny2q	cmlmln63c0001gjmaaolbuyp9	909fd511efeca192af3507f0b1c456f347415846104d758b4276188440cec88b	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-27 01:31:05	2026-02-20 01:31:05.352	2026-02-20 01:31:10.617	2026-02-17 21:23:23.559	2026-02-20 01:31:10.709
cmlo8gm0o0000pgma9fmsdm8p	cmlmln63c0001gjmaaolbuyp9	597fca0eff20b2d1d4ed2808e0e7680eecca21ca079e1d8c8edf24dfb1e274d0	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::1	2026-02-23 12:47:18	2026-02-16 12:47:18.686	\N	2026-02-15 21:03:59.352	2026-02-16 12:47:18.687
cmlp8jyom0000h5stn5y218n5	cmlmln63c0001gjmaaolbuyp9	05cf4779f45e2a6fe4c71517f74b3efffb269804a243ac95887bb488d18d0394	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::1	2026-02-23 13:54:22	2026-02-16 13:54:22.038	\N	2026-02-16 13:54:21.91	2026-02-16 13:54:22.043
cmlny08q0000dy1p20o9blp53	cmlmln63c0001gjmaaolbuyp9	b7d082a088dd98f9079dc0f38406fcfbd70839af201c083f6cd131c065a43ba4	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-22 19:04:39	2026-02-15 19:04:39.908	\N	2026-02-15 16:11:19.464	2026-02-15 19:04:39.909
cmlp9r6j6000ucyst9ncic0p6	cmlp9r68p000tcystx4n9bos6	0f173f0fe12e80c171345c1f45f1a4892ad01293af7102071474bc83f278174f	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	::ffff:127.0.0.1	2026-02-23 14:27:58	2026-02-16 14:27:58.409	\N	2026-02-16 14:27:58.29	2026-02-16 14:27:58.409
cmlpaaxxq0010cystudy6la37	cmlpaaxo2000zcystpl6y918o	2e5037ecd74ae4a7f1d0ac0b89d902a5ea7b57122431a437b22329f5a0b8b4e3	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-23 14:43:20	2026-02-16 14:43:20.391	\N	2026-02-16 14:43:20.27	2026-02-16 14:43:20.391
cmlpmky33004ncystxueuear9	cmlpmkxrq004mcystmun3b3qw	942460e76879f1917f9981067ec8ef64202eaf2712f205a61cbbbba910457a63	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-23 20:52:45	2026-02-16 20:52:45.071	\N	2026-02-16 20:27:02.415	2026-02-16 20:52:45.071
cmlp9owbm0001cyst10cwor6r	cmlmln63c0001gjmaaolbuyp9	213ad357f59ffb682916900935b04fd5022a9c703992e7591be3b707e507c3c3	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-24 21:23:12	2026-02-17 21:23:12.278	\N	2026-02-16 14:26:11.746	2026-02-17 21:23:12.278
cmlsoyi4000pycystlfir0hfi	cmlmln63c0001gjmaaolbuyp9	3e56c23c15004b3dac4861932885b88a65ff80042aa9d071ed38251e8a17600c	Web-Linux armv81	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36	::ffff:127.0.0.1	2026-03-09 22:35:40	2026-03-02 22:35:40.609	\N	2026-02-18 23:56:52.655	2026-03-02 22:35:40.61
cmlp9qf5i000ccysti2sfq4cg	cmlmsftnq00043pl1hqfo936q	0fa703180b9939941e5bcef67777bcf3c596ca49d43f017b5cb576f25fcd4aa1	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-02 01:41:54	2026-02-23 01:41:54.891	\N	2026-02-16 14:27:22.806	2026-02-23 01:41:54.893
cmltj8wm300vbcyst7k61xc7i	cmltj8wbe00vacystivc4a1t9	304c29aa61a12fbf3b4b2a74810346499befebcb84c8f162bd71870943c7b2d8	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-26 14:04:46	2026-02-19 14:04:46.62	\N	2026-02-19 14:04:46.491	2026-02-19 14:04:46.621
cmlyim3e501bhcyst49oh78fo	cmlmsftnq00043pl1hqfo936q	d5001f035df5528536525d3e32d1e32253e24147764da4ac3ba98b4c42f923b0	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-18 21:02:27	2026-03-11 21:02:27.712	2026-03-11 21:02:50.358	2026-02-23 01:45:53.068	2026-03-11 21:02:50.427
cmlu7srzj00wacyst1kag80f9	cmlu7srq000w9cystx9qq0kxa	dda5c2d5031565edb37c1c33733ff6f82fafce97c9b6513eda07673bb5d5fa48	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-27 01:32:04	2026-02-20 01:32:04.519	2026-02-20 01:42:02.541	2026-02-20 01:32:04.399	2026-02-20 01:42:02.541
cmlu85p2g00wicystgfq2dg8n	cmlmln63c0001gjmaaolbuyp9	d682d23191c811c93fc294290939146d56286bd826add306ecf098d64691b7df	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-02-27 01:42:07	2026-02-20 01:42:07.263	\N	2026-02-20 01:42:07.144	2026-02-20 01:42:07.263
cmm9zq0py000cctstlvwfzt8p	cmlmln63c0001gjmaaolbuyp9	84fd4bc484224f5708498be9ae16674d1bd1f1caaf4c7a0b8b3343a1e4e5c0c8	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-12 13:44:25	2026-03-05 13:44:25.819	\N	2026-03-03 02:30:17.638	2026-03-05 13:44:25.819
cmm28yefg01mucyst154xiu0b	cmlp9r68p000tcystx4n9bos6	aee9b583274eac2082be6c1b0c648a8e9087d518337d41016ac1cb3adee787c5	Web-iPhone	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	::ffff:127.0.0.1	2026-03-04 16:26:35	2026-02-25 16:26:35.931	2026-02-25 16:30:16.949	2026-02-25 16:26:35.788	2026-02-25 16:30:16.95
cmm294fkf01nccyst143s8mse	cmlp9r68p000tcystx4n9bos6	78faafb5945cedde6f3f59688ed59ec3fcb38012187afac0c3dc8c4d99f9af6d	Web-iPhone	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	::ffff:127.0.0.1	2026-03-04 16:31:17	2026-02-25 16:31:17.323	\N	2026-02-25 16:31:17.199	2026-02-25 16:31:17.323
cmm5h4h6v001udyst6do4lsyc	cmlmln63c0001gjmaaolbuyp9	bfffee24439d5e73bdaebacbe1ec692d760c64124b3a6dc1d272022be10855c5	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-08 14:47:59	2026-03-01 14:47:59.829	\N	2026-02-27 22:38:34.759	2026-03-01 14:47:59.83
cmm8072i20000x6mam8m3pdbf	cmlmln63c0001gjmaaolbuyp9	8dd44cd5be6e45694f8c1c1b23112eb11507739da214c913098ad632feae5452	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-08 17:08:00	2026-03-01 17:08:00.903	\N	2026-03-01 17:08:00.746	2026-03-01 17:08:00.906
cmlu85py400wjcystgui6b906	cmlmln63c0001gjmaaolbuyp9	b3de23c5d2f19048a985e1d5f681d991393241f279d6ae0864e53aa770d1c78d	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-06 13:59:51	2026-02-27 13:59:51.286	\N	2026-02-20 01:42:08.284	2026-02-27 13:59:51.305
cmm80kxxr0000gqstohs6a509	cmlmln63c0001gjmaaolbuyp9	fd4165a16a30cd696ea9e95a3cedee0c14bd892d545d05236a9f7b5d3a74097d	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-10 02:24:58	2026-03-03 02:24:58.133	\N	2026-03-01 17:18:48.014	2026-03-03 02:24:58.134
cmm5h4gtb001tdystxkf76s4k	cmlmln63c0001gjmaaolbuyp9	c452229531092ad088f98ab5d5543637bf7293e8cfdcc62dd2bbb8941d2784b4	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-06 22:38:34	2026-02-27 22:38:34.421	\N	2026-02-27 22:38:34.271	2026-02-27 22:38:34.421
cmm9xdik10000pxmafv433i28	cmlmln63c0001gjmaaolbuyp9	a17d869950cbc24130bdda4d5990061c6b98aff016b6576142d2d790535d427c	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-13 16:28:02	2026-03-06 16:28:02.614	\N	2026-03-03 01:24:34.993	2026-03-06 16:28:02.618
cmmf3z8ho00051imajesovjwz	cmlmln63c0001gjmaaolbuyp9	914345a7b3d12a54c285ebd7ff0afec2e202768ba804cc3fdc38c7f031597ee9	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-13 16:28:17	2026-03-06 16:28:17.111	\N	2026-03-06 16:28:16.956	2026-03-06 16:28:17.111
cmme7mp4e003v2nstltk8lybs	cmlmln63c0001gjmaaolbuyp9	400947fa43c4320622d81d8d38433ffdf61b4c9aa65cb3a784923258cd676171	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-13 16:28:33	2026-03-06 16:28:33.883	\N	2026-03-06 01:22:44.27	2026-03-06 16:28:33.886
cmmrykani00007ima8y56z0co	cmlmln63c0001gjmaaolbuyp9	a12a621a5c7453c775d38e2cbe821c38012967c3010576eaa193f70671a2cc56	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-22 16:17:42	2026-03-15 16:17:42.278	\N	2026-03-15 16:17:42.126	2026-03-15 16:17:42.28
cmmf3zns70005xest09n6z4u1	cmlmln63c0001gjmaaolbuyp9	e17fffe590b4e65bad40d924d5b1b7f39123395160598127dc194185986c0af8	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 19:22:00	2026-03-15 19:22:00.037	\N	2026-03-06 16:28:36.775	2026-03-15 19:22:00.037
cmmowqtff0000z3maq4fnvn1x	cmlmln63c0001gjmaaolbuyp9	04db3b46456d429df45e147c92235e233d7718d5b49649ab296fbb863a3a2b2b	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-20 13:35:23	2026-03-13 13:35:23.34	\N	2026-03-13 13:03:28.635	2026-03-13 13:35:23.347
cmmmizn2s006zxestb79s7lkq	cmlmsftnq00043pl1hqfo936q	25a831f0a46faf7a560f845fc7dcb4a1e8dba3c59d1e4eae0b780f9a15be3839	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-20 14:42:30	2026-03-13 14:42:30.251	\N	2026-03-11 21:02:53.332	2026-03-13 14:42:30.252
cmmoxxsf2000bzhmat7znnoj4	cmlmln63c0001gjmaaolbuyp9	db30458913ba0ffc8cd2cdf36f016b6ba3b21cf8f857ccd8db66db97ca63d374	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-21 21:22:09	2026-03-14 21:22:09.921	\N	2026-03-13 13:36:53.534	2026-03-14 21:22:09.921
cmmqrq6qm0000mhmak7axiypk	cmlmln63c0001gjmaaolbuyp9	247d948aa1cfccd5145c2b751aa48798ad4b5fafc636f14db06aa5382532ad4b	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-21 20:57:54	2026-03-14 20:57:54.613	\N	2026-03-14 20:18:33.502	2026-03-14 20:57:54.614
cmmqu26aw002zormam6g1z6l1	cmlmln63c0001gjmaaolbuyp9	68e8e564e9bf7283cc5942664da79f91e5416be9cccb2d97765349869fe997b4	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-21 21:40:09	2026-03-14 21:40:09.635	2026-03-15 16:17:41.932	2026-03-14 21:23:52.04	2026-03-15 16:17:41.951
cmmrykank00017ima160yab7a	cmlmln63c0001gjmaaolbuyp9	eb38582ae46bf15df71f4ed6efdfbbac79504ce8961c13d5310574b0b5595a08	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-22 16:17:42	2026-03-15 16:17:42.282	2026-03-15 18:23:49.685	2026-03-15 16:17:42.128	2026-03-15 18:23:49.7
cmms32hyj0001r9makkufxwyz	cmlmln63c0001gjmaaolbuyp9	74218bc8fc08f8e365a48a6aef43f60c5d0cb9fc8fba27a3166eaf4807ea4099	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-22 18:23:50	2026-03-15 18:23:50.018	\N	2026-03-15 18:23:49.867	2026-03-15 18:23:50.02
cmms32hyg0000r9maaxnxa2t6	cmlmln63c0001gjmaaolbuyp9	d3fa76b40106c8d1eb997789f9b01c553a217cc90be99a25902356f4accf40b3	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::1	2026-03-22 18:23:50	2026-03-15 18:23:50.022	\N	2026-03-15 18:23:49.864	2026-03-15 18:23:50.023
cmms3p0og0000ruma43xhcsx6	cmlmln63c0001gjmaaolbuyp9	e499c9a71d2222d5d3d4aebecd355d92460de8fe6ef0da74d18d2a590a8dfa6f	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 18:41:20	2026-03-15 18:41:20.717	2026-03-15 19:07:49.532	2026-03-15 18:41:20.56	2026-03-15 19:07:49.533
cmms4n2ut000et7mairhkjrz3	cmlmln63c0001gjmaaolbuyp9	c459dd6d607b9ec89e3eb044479799d7ddb71d640df3386bfbdf0221e03fb232	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 19:07:49	2026-03-15 19:07:49.834	\N	2026-03-15 19:07:49.685	2026-03-15 19:07:49.836
cmms4n2uu000ft7mac41fy4ta	cmlmln63c0001gjmaaolbuyp9	d4b987995cbd76484aa97bdc634b3ad2697566bfbd36edeca2a009ddded7fb4f	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 19:07:49	2026-03-15 19:07:49.839	\N	2026-03-15 19:07:49.686	2026-03-15 19:07:49.839
cmms5isb6008uo7stg8twg5dg	cmlmln63c0001gjmaaolbuyp9	d5bac4f691d1e5dc91605b9faab9c469b632cf9e9f00fdac1b2c0ed19775aa95	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 19:32:29	2026-03-15 19:32:29.138	\N	2026-03-15 19:32:29.01	2026-03-15 19:32:29.138
cmms5ivat008vo7stplb1cixm	cmlmln63c0001gjmaaolbuyp9	8e70e651f5c57b530aea502d6ab0a8da822521f923f9609733e312fd72f29967	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 19:32:33	2026-03-15 19:32:33.005	\N	2026-03-15 19:32:32.885	2026-03-15 19:32:33.005
cmms76ytv0000anstcekmo722	cmlmln63c0001gjmaaolbuyp9	29b148dd2f342dc2eb76d5a7300b07f5e74ce2c49d98de6577675f0d5cb6998b	Web	curl/8.5.0	::1	2026-03-22 20:19:16	2026-03-15 20:19:16.86	\N	2026-03-15 20:19:16.819	2026-03-15 20:19:16.887
cmms7844d0001anstqspylpgr	cmlmln63c0001gjmaaolbuyp9	8fe1842b79e90ea40c3e965e7fc4c5ffdc9b8fe54662aee6f6e3e82b5ef97bcb	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 20:20:10	2026-03-15 20:20:10.338	\N	2026-03-15 20:20:10.333	2026-03-15 20:20:10.339
cmms7yggm0007anstxlshe92y	cmlmln63c0001gjmaaolbuyp9	1e6632b199b1e7a98ff867fd1842d93a8d3542d3870218a7516227701196a275	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 20:40:39	2026-03-15 20:40:39.387	\N	2026-03-15 20:40:39.382	2026-03-15 20:40:39.387
cmms8i8o3006tanstriqpkybd	cmlmln63c0001gjmaaolbuyp9	fed048f4693ffa78bc5dea7d2330bbdc8402e3e96d23e696c2fe92b6bac347eb	Web-Win32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	::ffff:127.0.0.1	2026-03-22 20:56:02	2026-03-15 20:56:02.409	\N	2026-03-15 20:56:02.403	2026-03-15 20:56:02.41
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, "passwordHash", "createdAt", "updatedAt") FROM stdin;
cmlmllozg0000gjma3dvbyplr	Teste User	teste.user.demo+6@gmail.com	$2b$10$PXf71UbTpxTgpIFaOueCFu/UVc61yscQGg/32pSb04pvDD6KEAdea	2026-02-14 17:36:19.131	2026-02-14 17:36:19.131
cmlmln63c0001gjmaaolbuyp9	matheus	matheusdsouza97@gmail.com	$2b$10$Zf7oXfkFiJQzEJ8z46L2MO5VdwTXh0/voApXB7kcbZl2VXw3/odtK	2026-02-14 17:37:27.96	2026-02-14 17:37:27.96
cmlmsftnq00043pl1hqfo936q	Vinicius	viniciusfloriani009@gmail.com	$2b$10$BcFrVfLcpyDAqaXF3kQp3uxtP5klpUC8OXljEhjpMc/rkY.zfNAcu	2026-02-14 20:47:42.566	2026-02-14 20:47:42.566
cmlnyju8p000c1mmacbc6gyin	Teste Model	teste.model.1771172792@gmail.com	$2b$10$0bnmQimVn5iW7P4KAPdn4eRKRgRsA6S0h1A.Adp4sT59dqRqnDhYq	2026-02-15 16:26:33.817	2026-02-15 16:26:33.817
cmlnyk7m7000g1mmazbvdii43	Teste Model	teste.model.1771172809@gmail.com	$2b$10$YLMUTztHievMxmUYMc48qOy5aqvPHEAvSID.2Bna6QRF3PRm/j2wq	2026-02-15 16:26:51.151	2026-02-15 16:26:51.151
cmlp9r68p000tcystx4n9bos6	Mileine	mileinebarcelos@gmail.com	$2b$10$gzrZ1d5bygER5YSz8BR4hOkR5tlQHb0SHMuhD.OLVWsYWMU0n/Ova	2026-02-16 14:27:57.913	2026-02-16 14:27:57.913
cmlpaaxo2000zcystpl6y918o	Bruno	bruno@dzigual.com.br	$2b$10$uwh9S36DmV3nNdv16slHjOw0d2a.jkTp4NZ0f8lFpCA0pyA66tA/W	2026-02-16 14:43:19.922	2026-02-16 14:43:19.922
cmlpmkxrq004mcystmun3b3qw	Juliano	julianofirme23@gmail.com	$2b$10$BzIjH5DydUhDd21x/h0gRe.Ejn8DQ/ZP6Nwscvz2O1RJ73nktBZ.y	2026-02-16 20:27:02.005	2026-02-16 20:27:02.005
cmltj8wbe00vacystivc4a1t9	Francisco Lucas	fcolucaslima14@gmail.com	$2b$10$Uz92scc9zFo8y0T4JvsyYeqnijln7AiK4rlEOemJwH0rBHRvQKdre	2026-02-19 14:04:46.106	2026-02-19 14:04:46.106
cmlu7srq000w9cystx9qq0kxa	matheus teste	florianimatheus97@gmail.com	$2b$10$UgxXMzgpZzXouEkvK35V1e3zhNCNdJQeCOeigTbRTSERtEZuLK64O	2026-02-20 01:32:04.056	2026-02-20 01:32:04.056
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f4d05687-cbec-44ed-9642-515287deaf8a	d4b8e77e8e77b4526224165d0063a290ab576f6eca09fa4eef5abc35dcddc5fd	2026-03-15 19:32:00.33616+00	20260314_modelsJson_to_jsonb		\N	2026-03-15 19:32:00.33616+00	0
\.


--
-- Name: DayEntry DayEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DayEntry"
    ADD CONSTRAINT "DayEntry_pkey" PRIMARY KEY (id);


--
-- Name: MonthlyRecord MonthlyRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MonthlyRecord"
    ADD CONSTRAINT "MonthlyRecord_pkey" PRIMARY KEY (id);


--
-- Name: MonthlyRecord MonthlyRecord_userId_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MonthlyRecord"
    ADD CONSTRAINT "MonthlyRecord_userId_month_key" UNIQUE ("userId", month);


--
-- Name: RefreshSession RefreshSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshSession"
    ADD CONSTRAINT "RefreshSession_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: RefreshSession_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RefreshSession_userId_idx" ON public."RefreshSession" USING btree ("userId");


--
-- Name: DayEntry DayEntry_monthlyRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DayEntry"
    ADD CONSTRAINT "DayEntry_monthlyRecordId_fkey" FOREIGN KEY ("monthlyRecordId") REFERENCES public."MonthlyRecord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MonthlyRecord MonthlyRecord_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MonthlyRecord"
    ADD CONSTRAINT "MonthlyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshSession RefreshSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshSession"
    ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict giiQulsmeBkQpYn1eviZtMQoYG813Vxr7PetBCeqdt8YsR8yBaXSlRcWUZ5rOwd


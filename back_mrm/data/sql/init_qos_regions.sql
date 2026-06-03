-- Init table stats_qos_regions and stats_qos_metropole

CREATE SEQUENCE IF NOT EXISTS mrm_private.stats_qos_regions_fid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;
	
CREATE SEQUENCE IF NOT EXISTS mrm_private.stats_qos_metropole_fid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;
	
CREATE TABLE IF NOT EXISTS mrm_private.stats_qos_regions
(
    id integer DEFAULT nextval('mrm_private.stats_qos_regions_fid_seq'::regclass),
    nom_region character varying COLLATE pg_catalog."default",
    insee_reg character varying(3) COLLATE pg_catalog."default",
    service character varying(20) COLLATE pg_catalog."default",
    zone character varying(20) COLLATE pg_catalog."default",
    situation character varying(20) COLLATE pg_catalog."default",
    mccmnc character varying COLLATE pg_catalog."default",
    resultat numeric,
    nb_test numeric,
    filename text COLLATE pg_catalog."default",
    CONSTRAINT qos_stat_regions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS mrm_private.stats_qos_metropole
(
    id integer DEFAULT nextval('mrm_private.stats_qos_metropole_fid_seq'::regclass),
    service character varying(20) COLLATE pg_catalog."default",
    zone character varying(20) COLLATE pg_catalog."default",
    situation character varying(20) COLLATE pg_catalog."default",
    mccmnc character varying COLLATE pg_catalog."default",
    resultat numeric,
    nb_test numeric,
    filename text COLLATE pg_catalog."default",
    CONSTRAINT qos_stat_metropole_pkey PRIMARY KEY (id)
);


// @ts-nocheck
// @ts-nocheck
import {
	IsValidURL,
	IsValidGHObject,
	IsValidObject,
	IsValidNav,
	IsValidHero,
	IsValidI18n,
	IsValidAnalytics,
	IsValidColors,
	IsValidJSONString
} from "./validators.js";
import db from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const saltRounds = 10;
const DUMMY_SECRET = "DUMMY_SECRET";

const siteDataKeys = [
	{
		key: "title",
		isValid: (value) => typeof value === "string" && value.trim().length > 0,
		data_type: "string"
	},
	{
		key: "siteName",
		isValid: (value) => typeof value === "string" && value.trim().length > 0,
		data_type: "string"
	},
	{
		key: "siteURL",
		isValid: IsValidURL,
		data_type: "string"
	},
	{
		key: "home",
		isValid: (value) => typeof value === "string" && value.trim().length > 0,
		data_type: "string"
	},
	{
		key: "favicon",
		isValid: (value) => typeof value === "string" && value.trim().length > 0,
		data_type: "string"
	},
	{
		key: "logo",
		isValid: (value) => typeof value === "string" && value.trim().length > 0,
		data_type: "string"
	},
	{
		key: "metaTags",
		isValid: IsValidJSONString,
		data_type: "object"
	},
	{
		key: "nav",
		isValid: IsValidNav,
		data_type: "object"
	},
	{
		key: "hero",
		isValid: IsValidHero,
		data_type: "object"
	},
	{
		key: "footerHTML",
		isValid: (value) => typeof value === "string",
		data_type: "string"
	},
	{
		key: "i18n",
		isValid: IsValidI18n,
		data_type: "object"
	},
	{
		key: "pattern",
		//string dots or sqaures or circ
		isValid: (value) =>
			typeof value === "string" && ["dots", "squares", "none"].includes(value),
		data_type: "string"
	},
	{
		key: "analytics",
		isValid: IsValidAnalytics,
		data_type: "object"
	},
	{
		key: "theme",
		//light dark system none
		isValid: (value) =>
			typeof value === "string" && ["light", "dark", "system", "none"].includes(value),
		data_type: "string"
	},
	{
		key: "themeToggle",
		//boolean
		isValid: (value) => typeof value === "string",
		data_type: "string"
	},
	{
		key: "barStyle",
		//PARTIAL or FULL
		isValid: (value) => typeof value === "string" && ["PARTIAL", "FULL"].includes(value),
		data_type: "string"
	},
	{
		key: "barRoundness",
		//SHARP or ROUNDED
		isValid: (value) => typeof value === "string" && ["SHARP", "ROUNDED"].includes(value),
		data_type: "string"
	},
	{
		key: "summaryStyle",
		//CURRENT or DAY
		isValid: (value) => typeof value === "string" && ["CURRENT", "DAY"].includes(value),
		data_type: "string"
	},
	{
		key: "colors",
		isValid: IsValidColors,
		data_type: "object"
	},
	{
		key: "font",
		isValid: IsValidJSONString,
		data_type: "object"
	},
	{
		key: "categories",
		isValid: IsValidJSONString,
		data_type: "object"
	},
	{
		key: "homeIncidentCount",
		isValid: (value) => parseInt(value) >= 0,
		data_type: "string"
	},
	{
		key: "homeIncidentStartTimeWithin",
		isValid: (value) => parseInt(value) >= 1,
		data_type: "string"
	}
];

export function InsertKeyValue(key, value) {
	let f = siteDataKeys.find((k) => k.key === key);
	if (!f) {
		console.trace(`Invalid key: ${key}`);
		throw new Error(`Invalid key: ${key}`);
	}
	if (!f.isValid(value)) {
		console.trace(`Invalid value for key: ${key}`);
		throw new Error(`Invalid value for key: ${key}`);
	}
	let isValid = siteDataKeys.find((k) => k.key === key).isValid(value);
	if (!isValid) {
		console.trace(`Invalid value for key: ${key}`);
		throw new Error(`Invalid value for key: ${key}`);
	}
	return db.insertOrUpdateSiteData(key, value, f.data_type);
}

export async function GetAllSiteData() {
	let data = await db.getAllSiteData();
	//return all data as key value pairs, transform using data_type
	let transformedData = {};
	for (const d of data) {
		if (d.data_type === "object") {
			transformedData[d.key] = JSON.parse(d.value);
		} else {
			transformedData[d.key] = d.value;
		}
	}
	return transformedData;
}

export const CreateUpdateMonitor = async (monitor) => {
	let monitorData = { ...monitor };
	if (monitorData.id) {
		return await db.updateMonitor(monitorData);
	} else {
		return await db.insertMonitor(monitorData);
	}
};

export const GetMonitors = async (data) => {
	return await db.getMonitors(data);
};
export const GetMonitorsParsed = async (data) => {
	let monitors = await db.getMonitors(data);
	let parsedMonitors = monitors.map((m) => {
		let parsedMonitor = { ...m };
		if (!!parsedMonitor.type_data) {
			parsedMonitor.type_data = JSON.parse(parsedMonitor.type_data);
		} else {
			parsedMonitor.type_data = {};
		}
		return parsedMonitor;
	});
	return parsedMonitors;
};

export const CreateUpdateTrigger = async (alert) => {
	let alertData = { ...alert };
	if (alertData.id) {
		return await db.updateTrigger(alertData);
	} else {
		return await db.createNewTrigger(alertData);
	}
};

export const GetAllTriggers = async (data) => {
	return await db.getTriggers(data);
};

export const GetTriggerByID = async (id) => {
	return await db.getTriggerByID(id);
};

export const UpdateTriggerData = async (data) => {
	return await db.updateMonitorTrigger(data);
};

export const HashPassword = async (plainTextPassword) => {
	try {
		const hash = await bcrypt.hash(plainTextPassword, saltRounds);
		return hash;
	} catch (err) {
		console.error("Error hashing password:", err);
		throw err;
	}
};
const GenerateSalt = async () => {
	try {
		const salt = await bcrypt.genSalt(saltRounds);
		console.log("Generated Salt:", salt);
		return salt;
	} catch (err) {
		console.error("Error generating salt:", err);
		throw err;
	}
};

export const VerifyPassword = async (plainTextPassword, hashedPassword) => {
	try {
		const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
		return isMatch;
	} catch (err) {
		console.error("Error verifying password:", err);
		throw err;
	}
};

export const GenerateToken = async (data) => {
	try {
		const token = jwt.sign(data, process.env.KENER_SECRET_KEY || DUMMY_SECRET, {
			expiresIn: "1y"
		});
		return token;
	} catch (err) {
		console.error("Error generating token:", err);
		throw err;
	}
};

export const ForgotPasswordJWT = async (data) => {
	try {
		const token = jwt.sign(data, process.env.KENER_SECRET_KEY || DUMMY_SECRET, {
			expiresIn: "1h"
		});
		return token;
	} catch (err) {
		console.error("Error generating token:", err);
		throw err;
	}
};

export const VerifyToken = async (token) => {
	try {
		const decoded = jwt.verify(token, process.env.KENER_SECRET_KEY || DUMMY_SECRET);
		return decoded; // Returns the decoded payload if the token is valid
	} catch (err) {
		console.error("Error verifying token:", err);
		return undefined; // Returns null if the token is invalid
	}
};

export const GetAllAlertsPaginated = async (data) => {
	return {
		alerts: await db.getMonitorAlertsPaginated(data.page, data.limit),
		total: await db.getMonitorAlertsCount()
	};
};
function generateApiKey() {
	const prefix = "kener_";
	const randomKey = crypto.randomBytes(32).toString("hex"); // 64-character hexadecimal string
	return prefix + randomKey;
}
function createHash(apiKey) {
	return crypto
		.createHmac("sha256", process.env.KENER_SECRET_KEY || DUMMY_SECRET)
		.update(apiKey)
		.digest("hex");
}

export const MaskString = (str) => {
	const len = str.length;
	const mask = "*";
	const masked = mask.repeat(len - 4) + str.substring(len - 4);
	return masked;
};

export const CreateNewAPIKey = async (data) => {
	//generate a new key
	const apiKey = generateApiKey();
	const hashed_key = await createHash(apiKey);
	//insert into db
	await db.createNewApiKey({
		name: data.name,
		hashed_key: hashed_key,
		masked_key: MaskString(apiKey)
	});

	return {
		apiKey: apiKey,
		name: data.name
	};
};

export const GetAllAPIKeys = async () => {
	return await db.getAllApiKeys();
};

//update status of api key
export const UpdateApiKeyStatus = async (data) => {
	return await db.updateApiKeyStatus(data);
};

export const VerifyAPIKey = async (apiKey) => {
	const hashed_key = createHash(apiKey);
	// Check if the hash exists in the database
	const record = await db.getApiKeyByHashedKey(hashed_key);

	if (!!record) {
		return record.status == "ACTIVE";
	} // Adjust this for your DB query
	return false;
};

export const IsSetupComplete = async () => {
	let data = await db.getAllSiteData();

	if (!data) {
		return false;
	}
	return data.length > 0;
};

export const HashString = (str) => {
	const hash = crypto.createHash("sha256");
	hash.update(str);
	return hash.digest("hex");
};

export const GetDataGroupByDayAlternative = async (
	monitor_tag,
	start,
	end,
	timezoneOffsetMinutes = 0
) => {
	const offsetMinutes = Number(timezoneOffsetMinutes);
	if (isNaN(offsetMinutes)) {
		throw new Error("Invalid timezone offset. Must be a number representing minutes from UTC.");
	}

	const offsetSeconds = offsetMinutes * 60;

	const rawData = await db.getDataGroupByDayAlternative(monitor_tag, start, end);
	const groupedData = rawData.reduce((acc, row) => {
		// Calculate day group considering timezone offset
		const dayGroup = Math.floor((row.timestamp + offsetSeconds) / 86400);
		if (!acc[dayGroup]) {
			acc[dayGroup] = {
				timestamp: dayGroup * 86400 - offsetSeconds, // start of day in UTC
				total: 0,
				UP: 0,
				DOWN: 0,
				DEGRADED: 0,
				latencySum: 0,
				latencies: []
			};
		}

		const group = acc[dayGroup];
		group.total++;
		group[row.status]++;
		group.latencySum += row.latency;
		group.latencies.push(row.latency);

		return acc;
	}, {});

	// Transform grouped data to final format
	return Object.values(groupedData).map((group) => ({
		timestamp: group.timestamp,
		total: group.total,
		UP: group.UP,
		DOWN: group.DOWN,
		DEGRADED: group.DEGRADED,
		avgLatency: group.total > 0 ? Number((group.latencySum / group.total).toFixed(3)) : null,
		maxLatency:
			group.latencies.length > 0 ? Number(Math.max(...group.latencies).toFixed(3)) : null,
		minLatency:
			group.latencies.length > 0 ? Number(Math.min(...group.latencies).toFixed(3)) : null
	}));
};

export const CreateIncident = async (data) => {
	//return error if no title or startDateTime
	if (!data.title || !data.start_date_time) {
		throw new Error("Title and startDateTime are required");
	}

	let incident = {
		title: data.title,
		start_date_time: data.start_date_time,
		status: !!data.status ? data.status : "OPEN",
		end_date_time: !!data.end_date_time ? data.end_date_time : null,
		state: !!data.state ? data.state : "INVESTIGATING"
	};

	//if endDateTime is provided and it is less than startDateTime, throw error
	if (incident.end_date_time && incident.end_date_time < incident.start_date_time) {
		throw new Error("End date time cannot be less than start date time");
	}

	let newIncident = await db.createIncident(incident);

	return {
		incident_id: newIncident.lastInsertRowid
	};
};

export const UpdateIncident = async (incident_id, data) => {
	let incidentExists = await db.getIncidentById(incident_id);

	if (!incidentExists) {
		throw new Error(`Incident with id ${incident_id} does not exist`);
	}

	let endDateTime = data.end_date_time;
	if (endDateTime && endDateTime < incidentExists.start_date_time) {
		throw new Error("End date time cannot be less than start date time");
	}

	let updateObject = {
		id: incident_id,
		title: data.title || incidentExists.title,
		start_date_time: data.start_date_time || incidentExists.start_date_time,
		status: data.status || incidentExists.status,
		state: data.state || incidentExists.state,
		end_date_time: data.end_date_time || incidentExists.end_date_time
	};
	return await db.updateIncident(updateObject);
};

export const ParseIncidentToAPIResp = async (incident_id) => {
	let incident = await db.getIncidentById(incident_id);
	if (!incident) {
		throw new Error(`Incident with id ${incident_id} not found`);
	}
	let resp = {
		id: incident.id,
		start_date_time: incident.start_date_time,
		end_date_time: incident.end_date_time,
		created_at: incident.created_at,
		updated_at: incident.updated_at,
		title: incident.title,
		status: incident.status,
		state: incident.state
	};

	return resp;
};

export const GetIncidentMonitors = async (incident_id) => {
	let incidentExists = await db.getIncidentById(incident_id);
	if (!incidentExists) {
		throw new Error(`Incident with id ${incident_id} does not exist`);
	}
	let incidentMonitors = await db.getIncidentMonitorsByIncidentID(incident_id);
	return incidentMonitors.map((m) => ({
		monitor_tag: m.monitor_tag,
		monitor_impact: m.monitor_impact
	}));
};

export const RemoveIncidentMonitor = async (incident_id, monitor_tag) => {
	let incidentExists = await db.getIncidentById(incident_id);
	if (!incidentExists) {
		throw new Error(`Incident with id ${incident_id} does not exist`);
	}
	return await db.removeIncidentMonitor(incident_id, monitor_tag);
};

export const AddIncidentMonitor = async (incident_id, monitor_tag, monitor_impact) => {
	//monitor_impact must be DOWN or DEGRADED or NONE
	if (!["DOWN", "DEGRADED"].includes(monitor_impact)) {
		throw new Error("Monitor impact must be either DOWN, DEGRADED ");
	}

	//check if monitor exists
	let monitorExists = await db.getMonitorByTag(monitor_tag);
	if (!monitorExists) {
		throw new Error(`Monitor with tag ${monitor_tag} does not exist`);
	}

	//check if incident exists
	let incidentExists = await db.getIncidentById(incident_id);
	if (!incidentExists) {
		throw new Error(`Incident with id ${incident_id} does not exist`);
	}

	return await db.insertIncidentMonitor(incident_id, monitor_tag, monitor_impact);
};

export const GetIncidentComments = async (incident_id) => {
	let incidentExists = await db.getIncidentById(incident_id);
	if (!incidentExists) {
		throw new Error(`Incident with id ${incident_id} does not exist`);
	}
	return await db.getIncidentComments(incident_id);
};
export const GetIncidentActiveComments = async (incident_id) => {
	let incidentExists = await db.getIncidentById(incident_id);
	if (!incidentExists) {
		throw new Error(`Incident with id ${incident_id} does not exist`);
	}
	return await db.getActiveIncidentComments(incident_id);
};

export const UpdateCommentByID = async (incident_id, comment_id, comment, state, commented_at) => {
	let incidentExists = await db.getIncidentById(incident_id);
	if (!incidentExists) {
		throw new Error(`Incident with id ${incident_id} does not exist`);
	}
	let commentExists = await db.getIncidentCommentByIDAndIncident(incident_id, comment_id);
	if (!commentExists) {
		throw new Error(`Comment with id ${comment_id} does not exist`);
	}
	let c = await db.updateIncidentCommentByID(comment_id, comment, state, commented_at);
	if (c) {
		let incidentUpdate = {
			state: state
		};
		if (state === "RESOLVED") {
			incidentUpdate.end_date_time = commented_at;
		} else {
			if (incidentExists.state === "RESOLVED") {
				await db.setIncidentEndTimeToNull(incident_id);
			}
		}
		await UpdateIncident(incident_id, incidentUpdate);
	}
	return c;
};
export const AddIncidentComment = async (incident_id, comment, state, commented_at) => {
	let incidentExists = await db.getIncidentById(incident_id);
	if (!incidentExists) {
		throw new Error(`Incident with id ${incident_id} does not exist`);
	}

	if (!!!state) {
		state = incidentExists.state;
	}

	let c = await db.insertIncidentComment(incident_id, comment, state, commented_at);

	//update incident state
	if (c) {
		let incidentUpdate = {
			state: state
		};
		if (state === "RESOLVED") {
			incidentUpdate.end_date_time = commented_at;
		} else {
			if (incidentExists.state === "RESOLVED") {
				await db.setIncidentEndTimeToNull(incident_id);
			}
		}
		await UpdateIncident(incident_id, incidentUpdate);
	}

	return c;
};

export const UpdateCommentStatusByID = async (incident_id, comment_id, status) => {
	let commentExists = await db.getIncidentCommentByIDAndIncident(incident_id, comment_id);
	if (!commentExists) {
		throw new Error(`Comment with id ${comment_id} does not exist`);
	}
	return await db.updateIncidentCommentStatusByID(comment_id, status);
};

export const GetIncidentsDashboard = async (data) => {
	let filter = {};
	if (data.filter.status != "ALL") {
		filter = { status: data.filter.status };
	}

	let incidents = await db.getIncidentsPaginatedDesc(data.page, data.limit, filter);
	let total = await db.getIncidentsCount(filter);

	for (let i = 0; i < incidents.length; i++) {
		incidents[i].monitors = await GetIncidentMonitors(incidents[i].id);
	}

	return {
		incidents: incidents,
		total: total
	};
};

export const GetIncidentsOpenHome = async (homeIncidentCount, start, end) => {
	homeIncidentCount = parseInt(homeIncidentCount);

	if (homeIncidentCount < 0) {
		homeIncidentCount = 0;
	}

	if (homeIncidentCount === 0) {
		return [];
	}
	let incidents = await db.getRecentUpdatedIncidents(homeIncidentCount, start, end);
	for (let i = 0; i < incidents.length; i++) {
		incidents[i].monitors = await GetIncidentMonitors(incidents[i].id);
	}

	//get comments
	for (let i = 0; i < incidents.length; i++) {
		incidents[i].comments = await GetIncidentActiveComments(incidents[i].id);
	}

	return incidents;
};
export const GetIncidentsPage = async (start, open) => {
	let incidents = await db.getIncidentsBetween(start, open);
	for (let i = 0; i < incidents.length; i++) {
		incidents[i].monitors = await GetIncidentMonitors(incidents[i].id);
	}

	//get comments
	for (let i = 0; i < incidents.length; i++) {
		incidents[i].comments = await GetIncidentActiveComments(incidents[i].id);
	}

	return incidents;
};
export const GetIncidentsByIDS = async (ids) => {
	if (ids.length == 0) {
		return [];
	}
	let incidents = await db.getIncidentsByIds(ids);
	for (let i = 0; i < incidents.length; i++) {
		incidents[i].monitors = [];
	}

	//get comments
	for (let i = 0; i < incidents.length; i++) {
		incidents[i].comments = await GetIncidentActiveComments(incidents[i].id);
	}

	return incidents;
};

export const InsertNewAlert = async (data) => {
	if (await db.alertExists(data.monitor_tag, data.monitor_status, data.alert_status)) {
		return;
	}
	await db.insertAlert(data);
	return await db.getActiveAlert(data.monitor_tag, data.monitor_status, data.alert_status);
};

export const IsLoggedInSession = async (cookies) => {
	let tokenData = cookies.get("kener-user");
	if (!!!tokenData) {
		//redirect to signin page if user is not authenticated
		//throw redirect(302, base + "/signin");
		return {
			error: "User not authenticated",
			action: "redirect",
			location: "/manage/signin"
		};
	}
	let tokenUser = await VerifyToken(tokenData);
	if (!!!tokenUser) {
		//redirect to signin page if user is not authenticated
		// throw redirect(302, base + "/signin/logout");
		return {
			error: "User not authenticated",
			action: "redirect",
			location: "/manage/signin/logout"
		};
	}
	let userDB = await db.getUserByEmail(tokenUser.email);
	if (!!!userDB) {
		//redirect to signin page if user is not authenticated
		// throw redirect(302, base + "/signin");
		return {
			error: "User not authenticated",
			action: "redirect",
			location: "/manage/signin"
		};
	}
	return {
		user: userDB
	};
};

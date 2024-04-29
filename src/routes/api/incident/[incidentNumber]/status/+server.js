// @ts-nocheck
// @ts-ignore
import { json } from "@sveltejs/kit";
import { auth, GHIssueToKenerIncident } from "$lib/server/webhook";
import { UpdateIssueLabels, GetIncidentByNumber } from "../../../../../../scripts/github";

export async function POST({ request, params }) {
    if (!params.incidentNumber || isNaN(params.incidentNumber)) {
        return json(
            { error: "Invalid incidentNumber" },
            {
                status: 400,
            }
        );
    }

	if (!params.owner) {
        return json(
            { error: "Invalid github owner" },
            {
                status: 400,
            }
        );
    }
    
	if (!params.repo) {
        return json(
            { error: "Invalid github repo" },
            {
                status: 400,
            }
        );
    }

    const authError = auth(request);

    if (authError !== null) {
        return json(
            { error: authError.message },
            {
                status: 401,
            }
        );
    }

    const payload = await request.json();

    let isIdentified = payload.isIdentified; //string required and can be resolved or identified
    let isResolved = payload.isResolved; //string required and can be resolved or identified
    let endDatetime = payload.endDatetime; //in utc seconds optional

    if (endDatetime && typeof endDatetime !== "number") {
        return json(
            { error: "Invalid endDatetime" },
            {
                status: 400,
            }
        );
    }

    let issue = await GetIncidentByNumber(params.owner, params.repo, incidentNumber);

    if (issue === null) {
        return json(
            { error: "github error" },
            {
                status: 400,
            }
        );
    }

    let labels = issue.labels.map((label) => {
		return label.name;
	});

	if(isIdentified !== undefined) {
		labels = labels.filter((label) => label !== "identified");
		if(isIdentified === true){
			labels.push("identified");
		}
	}

	if(isResolved !== undefined) {
		labels = labels.filter((label) => label !== "resolved");
		if(isResolved === true){
			labels.push("resolved");
		}
	}
	
    let body = issue.body;
	if (endDatetime) {
		body = body.replace(/\[end_datetime:(\d+)\]/g, "");
        body = body.trim();
		body = body + " " + `[end_datetime:${endDatetime}]`;
	};

    let resp = await UpdateIssueLabels(github, incidentNumber, labels, body);
    if (resp === null) {
        return json(
            { error: "github error" },
            {
                status: 400,
            }
        );
    }
    
    return json(GHIssueToKenerIncident(resp), {
        status: 200,
    });
}

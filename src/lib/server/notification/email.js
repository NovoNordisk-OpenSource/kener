// @ts-nocheck
import { Resend } from "resend";

class Email {
	to;
	from;
	method;
	siteData;
	monitorData;

	constructor(meta, siteData, monitorData) {
		this.to = meta.to;
		this.from = meta.from;
		this.siteData = siteData;
		this.monitorData = monitorData;
	}

	transformData(data) {
		let ctaLink = data.actions[0].url;
		let ctaText = data.actions[0].text;
		let emailApiRequest = {
			from: this.from,
			to: this.to.split(",").map((email) => email.trim()),
			subject: `[${data.status}] ${data.alert_name}  at ${data.timestamp}`,
			text: `Alert ${data.alert_name} has been ${data.status} at ${data.timestamp}. Click here to view the alert: ${ctaLink}`,
			html: ""
		};

		let bgColor = "#f4f4f4";
		if (data.severity == "critical") {
			bgColor = this.siteData.colors.DOWN;
		} else if (data.severity == "warning") {
			bgColor = this.siteData.colors.DEGRADED;
		}

		if (data.status === "RESOLVED") {
			bgColor = this.siteData.colors.UP;
		}

		let html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Alert Notification</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
					line-height: 1.6;
					margin: 0;
					padding: 0;
					background-color: #f4f4f4;
					color: #333;
				}
				.container {
					max-width: 600px;
					margin: 20px auto;
					padding: 20px;
					background: #ffffff;
					border-radius: 8px;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				}
				.header {
					text-align: center;
					padding-bottom: 20px;
					border-bottom: 1px solid #eee;
				}
				.alert-badge {
					display: inline-block;
					padding: 6px 12px;
					border-radius: 16px;
					background-color: ${bgColor};
					color: white;
					font-weight: 500;
					font-size: 14px;
					margin-bottom: 16px;
				}
				.alert-title {
					font-size: 24px;
					font-weight: 600;
					margin: 0;
					color: #2c3e50;
				}
				.metric-box {
					background: #f8f9fa;
					border-radius: 6px;
					padding: 16px;
					margin: 16px 0;
				}
				.button {
					display: inline-block;
					padding: 12px 24px;
					background-color: #007bff;
					color: white;
					text-decoration: none;
					border-radius: 6px;
					font-weight: 500;
					margin-top: 20px;
				}
				.footer {
					text-align: center;
					padding-top: 20px;
					color: #666;
					font-size: 14px;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<table width="100%" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td>
							<a href="${this.siteData.siteURL}" style="text-decoration: none;">
								<span style="font-size: 24px; font-weight: 600; color: #2c3e50;">${this.siteData.siteName}</span>
							</a>
						</td>
					</tr>
				</table>

				<div class="header">
					<div class="alert-badge">${data.status}</div>
					<h1 class="alert-title">${data.alert_name}</h1>
				</div>
				
				<table width="100%" border="0" cellspacing="0" cellpadding="8">
					<tr style="border-bottom: 1px solid #eee;">
						<td width="40%" style="color: #666; font-weight: 500;">Alert ID</td>
						<td width="60%" style="text-align: right;">${data.id}</td>
					</tr>
					<tr style="border-bottom: 1px solid #eee;">
						<td width="40%" style="color: #666; font-weight: 500;">Status</td>
						<td width="60%" style="text-align: right;">${data.status}</td>
					</tr>
					<tr style="border-bottom: 1px solid #eee;">
						<td width="40%" style="color: #666; font-weight: 500;">Time</td>
						<td width="60%" style="text-align: right;">${data.timestamp}</td>
					</tr>
				</table>
				
				<div class="metric-box">
					<table width="100%" border="0" cellspacing="0" cellpadding="8">
						<tr>
							<td width="40%" style="color: #666; font-weight: 500;">Current Value</td>
							<td width="60%" style="text-align: right;">${data.details.current_value}</td>
						</tr>
						<tr>
							<td width="40%" style="color: #666; font-weight: 500;">Threshold Set</td>
							<td width="60%" style="text-align: right;">${data.details.threshold}</td>
						</tr>
					</table>
				</div>
				
				<p style="margin: 20px 0;">${data.description}</p>
				
				<table width="100%" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td align="center">
							<a href="${ctaLink}" class="button">${ctaText}</a>
						</td>
					</tr>
				</table>
				
				<div class="footer">
					This is an automated alert notification from ${this.siteData.siteName} monitoring system.
				</div>
			</div>
		</body>
		</html>
		`;

		emailApiRequest.html = html;

		return emailApiRequest;
	}

	type() {
		return "email";
	}

	async send(data) {
		const resend = new Resend(process.env.RESEND_API_KEY);

		try {
			return await resend.emails.send(this.transformData(data));
		} catch (error) {
			console.error("Error sending webhook", error);
			return error;
		}
	}
}

export default Email;

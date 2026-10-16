"use strict";

/*
 * GitHub through @octokit/rest 16 (pre-plugin architecture, `new Octokit({ auth })` still works).
 * The raw calls use the legacy team endpoints (/teams/{team_id}/...) that GitHub removed in favour
 * of /orgs/{org}/teams/{team_slug}/..., and the old `reactions` preview that no longer needs a header.
 */

const axios = require("axios");
const Octokit = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || "ghp_placeholder" });
const TEAM_ID = process.env.GITHUB_OPS_TEAM_ID || "123456";

async function listOpsTeam() {
  const res = await axios.get(`https://api.github.com/teams/${TEAM_ID}/members`, {
    headers: { Authorization: `token ${process.env.GITHUB_TOKEN || "ghp_placeholder"}` },
  });
  return res.data.map((m) => m.login);
}

async function addToOpsTeam(username) {
  return axios.put(`https://api.github.com/teams/${TEAM_ID}/memberships/${username}`, null, {
    headers: { Authorization: `token ${process.env.GITHUB_TOKEN || "ghp_placeholder"}` },
  });
}

async function reactToIssue(owner, repo, issueNumber) {
  return octokit.reactions.createForIssue({
    owner,
    repo,
    issue_number: issueNumber,
    content: "rocket",
    headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
  });
}

async function openIncident(owner, repo, title, body) {
  return octokit.issues.create({ owner, repo, title, body, labels: ["incident"] });
}

module.exports = { listOpsTeam, addToOpsTeam, reactToIssue, openIncident };

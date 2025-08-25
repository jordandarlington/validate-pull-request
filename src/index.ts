import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
    try {
        const pullRequest = github.context.payload.pull_request;

        if (!pullRequest) {
            core.setFailed('❌ This action can only be run on pull_request events.');
            return;
        }

        // --- Inputs ---
        // Title
        const checkTitle = core.getBooleanInput('check-title');
        const rawTitleLength = core.getInput('title-length');
        const titleLength = rawTitleLength ? parseInt(rawTitleLength, 10) : 0;
        const titlePattern = core.getInput('title-pattern');

        // Body
        const checkBody = core.getBooleanInput('check-body');
        const rawBodyLength = core.getInput('body-length');
        const bodyLength = rawBodyLength ? parseInt(rawBodyLength, 10) : 0;

        // Branch
        const branchPattern = core.getInput('branch-pattern');

        // Draft Status
        const checkDraft = core.getBooleanInput('check-draft');

        // --- Checks ---
        const errors: string[] = [];
        //TODO: const summary: string[] = [];

        // Title
        if (checkTitle) {
            if (!pullRequest.title || pullRequest.title.trim().length === 0) {
                errors.push('❌ Pull request title is required.');
            } else {
                core.info('✅ Pull request has a title.');
                if (titleLength > 0 && pullRequest.title.length < titleLength) {
                    errors.push(`❌ Pull request title must be at least ${titleLength} characters long.`);
                } else {
                    core.info(`✅ Pull request title meets the minimum length of ${titleLength} characters.`);
                }
                if (titlePattern) {
                    const regex = new RegExp(titlePattern);
                    if (!regex.test(pullRequest.title)) {
                        errors.push(`❌ Pull request title does not match the required pattern: \`${titlePattern}\`.`);
                    } else {
                        core.info(`✅ Pull request title matches the required pattern: \`${titlePattern}\`.`);
                    }
                }
            }
        }

        // Body
        if (checkBody) {
            if (!pullRequest.body || pullRequest.body.trim().length === 0) {
                errors.push('❌ Pull request body is required.');
            } else {
                core.info('✅ Pull request has a body.');
                if (bodyLength > 0 && pullRequest.body.length < bodyLength) {
                    errors.push(`❌ Pull request body must be at least ${bodyLength} characters long.`);
                } else {
                    core.info(`✅ Pull request body meets the minimum length of ${bodyLength} characters.`);
                }
            }
        }

        // Branch
        if (branchPattern) {
            const regex = new RegExp(branchPattern);
            if (!regex.test(pullRequest.head.ref)) {
                errors.push(`❌ Pull request branch name \`${pullRequest.head.ref}\` does not match the required pattern: \`${branchPattern}\`.`);
            } else {
                core.info(`✅ Pull request branch name \`${pullRequest.head.ref}\` matches the required pattern: \`${branchPattern}\`.`);
            }
        }

        // Draft Status
        if (checkDraft) {
            if (pullRequest.draft) {
                errors.push('❌ Pull request should not be a draft.');
            } else {
                core.info('✅ Pull request is not a draft.');
            }
        }

        // TODO: Update/Improve Summary Report
        core.startGroup('Error Summary');
        if (errors.length > 0) {
            errors.forEach(err => core.error(err));
            core.setFailed(`❌ Pull request validation failed with ${errors.length} error(s).`);
        } else {
            core.info(`✅ Pull request validation passed with no errors.`);
        }


    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);

    } finally {

    }
}
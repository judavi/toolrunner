import Q = require('q');
import shell = require('shelljs');
import fs = require('fs');
import path = require('path');
import os = require('os');
import minimatch = require('minimatch');
import im = require('./internal');
import tcm = require('./taskcommand');
import trm = require('./toolrunner');
import semver = require('semver');

export enum TaskResult {
    Succeeded = 0,
    SucceededWithIssues = 1,
    Failed = 2,
    Cancelled = 3,
    Skipped = 4
}

export enum TaskState {
    Unknown = 0,
    Initialized = 1,
    InProgress = 2,
    Completed = 3
}

export enum IssueType {
    Error,
    Warning
}

export enum ArtifactType {
    Container,
    FilePath,
    VersionControl,
    GitRef,
    TfvcLabel
}

export enum FieldType {
    AuthParameter,
    DataParameter,
    Url
}

/** Platforms supported by our build agent */
export enum Platform {
    Windows,
    MacOS,
    Linux
}

//-----------------------------------------------------
// General Helpers
//-----------------------------------------------------
export const setStdStream = im._setStdStream;
export const setErrStream = im._setErrStream;
//
// Catching all exceptions
//
process.on('uncaughtException', (err: Error) => {
    console.log(loc('LIB_UnhandledEx', err.message));
});

//-----------------------------------------------------
// Loc Helpers
//-----------------------------------------------------

//export const setResourcePath = im._setResourcePath;
export const loc = im._loc;

//-----------------------------------------------------
// Input Helpers
//-----------------------------------------------------

//export const getVariable = im._getVariable;

//-----------------------------------------------------
// Cmd Helpers
//-----------------------------------------------------

export const command = im._command;
export const warning = im._warning;
export const error = im._error;
export const debug = im._debug;

//-----------------------------------------------------
// Disk Functions
//-----------------------------------------------------
function _checkShell(cmd: string, continueOnError?: boolean) {
    var se = shell.error();

    if (se) {
        debug(cmd + ' failed');
        var errMsg = loc('LIB_OperationFailed', cmd, se);
        debug(errMsg);

        if (!continueOnError) {
            throw new Error(errMsg);
        }
    }
}

export interface FsStats extends fs.Stats {

}

/**
 * Exec a tool.  Convenience wrapper over ToolRunner to exec with args in one call.
 * Output will be streamed to the live console.
 * Returns promise with return code
 * 
 * @param     tool     path to tool to exec
 * @param     args     an arg string or array of args
 * @param     options  optional exec options.  See IExecOptions
 * @returns   number
 */
export function exec(tool: string, args: any, options?: trm.IExecOptions): Q.Promise<number> {
    let tr: trm.ToolRunner = this.tool(tool);
    tr.on('debug', (data: string) => {
        debug(data);
    });

    if (args) {
        if (args instanceof Array) {
            tr.arg(args);
        }
        else if (typeof (args) === 'string') {
            tr.line(args)
        }
    }
    return tr.exec(options);
}

/**
 * Exec a tool synchronously.  Convenience wrapper over ToolRunner to execSync with args in one call.
 * Output will be *not* be streamed to the live console.  It will be returned after execution is complete.
 * Appropriate for short running tools 
 * Returns IExecResult with output and return code
 * 
 * @param     tool     path to tool to exec
 * @param     args     an arg string or array of args
 * @param     options  optional exec options.  See IExecSyncOptions
 * @returns   IExecSyncResult
 */
export function execSync(tool: string, args: string | string[], options?: trm.IExecSyncOptions): trm.IExecSyncResult {
    let tr: trm.ToolRunner = this.tool(tool);
    tr.on('debug', (data: string) => {
        debug(data);
    });

    if (args) {
        if (args instanceof Array) {
            tr.arg(args);
        }
        else if (typeof (args) === 'string') {
            tr.line(args)
        }
    }

    return tr.execSync(options);
}

/**
 * Convenience factory to create a ToolRunner.
 * 
 * @param     tool     path to tool to exec
 * @returns   ToolRunner
 */
export function tool(tool: string) {
    let tr: trm.ToolRunner = new trm.ToolRunner(tool);
    tr.on('debug', (message: string) => {
        debug(message);
    })

    return tr;
}

//-----------------------------------------------------
// Tools
//-----------------------------------------------------
exports.TaskCommand = tcm.TaskCommand;
exports.commandFromString = tcm.commandFromString;
exports.ToolRunner = trm.ToolRunner;


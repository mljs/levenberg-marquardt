import { createJsWithTsEsmPreset } from "ts-jest";

/** @type {import("jest").Config} **/
export default {
  ...createJsWithTsEsmPreset(),
  testEnvironment: "node",
};
import { expect, test } from "vitest";
import {
  $,
  AssetValue,
  ExpressionValue,
  PageValue,
  ParameterValue,
  PlaceholderValue,
  renderTemplate,
} from "./jsx";
import { css } from "./css";

test("render jsx into instances with generated id", () => {
  const { instances } = renderTemplate(
    <$.Body>
      <$.Box></$.Box>
      <$.Box></$.Box>
    </$.Body>
  );
  expect(instances).toEqual([
    {
      type: "instance",
      id: "0",
      component: "Body",
      children: [
        { type: "id", value: "1" },
        { type: "id", value: "2" },
      ],
    },
    {
      type: "instance",
      id: "1",
      component: "Box",
      children: [],
    },
    {
      type: "instance",
      id: "2",
      component: "Box",
      children: [],
    },
  ]);
});

test("override generated ids with ws:id prop", () => {
  const { instances } = renderTemplate(
    <$.Body ws:id="custom1">
      <$.Box ws:id="custom2">
        <$.Span ws:id="custom3"></$.Span>
      </$.Box>
    </$.Body>
  );
  expect(instances).toEqual([
    {
      type: "instance",
      id: "custom1",
      component: "Body",
      children: [{ type: "id", value: "custom2" }],
    },
    {
      type: "instance",
      id: "custom2",
      component: "Box",
      children: [{ type: "id", value: "custom3" }],
    },
    {
      type: "instance",
      id: "custom3",
      component: "Span",
      children: [],
    },
  ]);
});

test("render text children", () => {
  const { instances } = renderTemplate(<$.Body>children</$.Body>);
  expect(instances).toEqual([
    {
      type: "instance",
      id: "0",
      component: "Body",
      children: [{ type: "text", value: "children" }],
    },
  ]);
});

test("render template children with top level instance", () => {
  const { children } = renderTemplate(<$.Box></$.Box>);
  expect(children).toEqual([{ type: "id", value: "0" }]);
});

test("render template children with multiple instances from fragment", () => {
  const { children, instances } = renderTemplate(
    <>
      <$.Box></$.Box>
      <$.Text></$.Text>
      <$.Button></$.Button>
    </>
  );
  expect(children).toEqual([
    { type: "id", value: "0" },
    { type: "id", value: "1" },
    { type: "id", value: "2" },
  ]);
  expect(instances).toEqual([
    { type: "instance", id: "0", component: "Box", children: [] },
    { type: "instance", id: "1", component: "Text", children: [] },
    { type: "instance", id: "2", component: "Button", children: [] },
  ]);
});

test("render literal props", () => {
  const { props } = renderTemplate(
    <$.Body data-string="string" data-number={0}>
      <$.Box data-bool={true} data-json={{ param: "value" }}></$.Box>
    </$.Body>
  );
  expect(props).toEqual([
    {
      id: "0:data-string",
      instanceId: "0",
      name: "data-string",
      type: "string",
      value: "string",
    },
    {
      id: "0:data-number",
      instanceId: "0",
      name: "data-number",
      type: "number",
      value: 0,
    },
    {
      id: "1:data-bool",
      instanceId: "1",
      name: "data-bool",
      type: "boolean",
      value: true,
    },
    {
      id: "1:data-json",
      instanceId: "1",
      name: "data-json",
      type: "json",
      value: { param: "value" },
    },
  ]);
});

test("render defined props", () => {
  const { props } = renderTemplate(
    <$.Body
      data-expression={new ExpressionValue("1 + 1")}
      data-parameter={new ParameterValue("parameterId")}
    >
      <$.Box
        data-asset={new AssetValue("assetId")}
        data-page={new PageValue("pageId")}
        data-instance={new PageValue("pageId", "instanceId")}
      ></$.Box>
    </$.Body>
  );
  expect(props).toEqual([
    {
      id: "0:data-expression",
      instanceId: "0",
      name: "data-expression",
      type: "expression",
      value: "1 + 1",
    },
    {
      id: "0:data-parameter",
      instanceId: "0",
      name: "data-parameter",
      type: "parameter",
      value: "parameterId",
    },
    {
      id: "1:data-asset",
      instanceId: "1",
      name: "data-asset",
      type: "asset",
      value: "assetId",
    },
    {
      id: "1:data-page",
      instanceId: "1",
      name: "data-page",
      type: "page",
      value: "pageId",
    },
    {
      id: "1:data-instance",
      instanceId: "1",
      name: "data-instance",
      type: "page",
      value: { pageId: "pageId", instanceId: "instanceId" },
    },
  ]);
});

test("render placeholder value", () => {
  const { instances } = renderTemplate(
    <$.Body>{new PlaceholderValue("Placeholder text")}</$.Body>
  );
  expect(instances).toEqual([
    {
      type: "instance",
      id: "0",
      component: "Body",
      children: [
        { type: "text", value: "Placeholder text", placeholder: true },
      ],
    },
  ]);
});

test("generate local styles", () => {
  const { breakpoints, styleSources, styleSourceSelections, styles } =
    renderTemplate(
      <$.Body
        ws:style={css`
          color: red;
        `}
      >
        <$.Box
          ws:style={css`
            font-size: 10px;
          `}
        ></$.Box>
      </$.Body>
    );
  expect(breakpoints).toEqual([{ id: "base", label: "" }]);
  expect(styleSources).toEqual([
    { id: "0:ws:style", type: "local" },
    { id: "1:ws:style", type: "local" },
  ]);
  expect(styleSourceSelections).toEqual([
    { instanceId: "0", values: ["0:ws:style"] },
    { instanceId: "1", values: ["1:ws:style"] },
  ]);
  expect(styles).toEqual([
    {
      breakpointId: "base",
      styleSourceId: "0:ws:style",
      property: "color",
      value: { type: "keyword", value: "red" },
    },
    {
      breakpointId: "base",
      styleSourceId: "1:ws:style",
      property: "fontSize",
      value: { type: "unit", unit: "px", value: 10 },
    },
  ]);
});

test("generate local styles with states", () => {
  const { styles } = renderTemplate(
    <$.Body
      ws:style={css`
        color: red;
        &:hover {
          color: blue;
        }
      `}
    ></$.Body>
  );
  expect(styles).toEqual([
    {
      breakpointId: "base",
      styleSourceId: "0:ws:style",
      property: "color",
      value: { type: "keyword", value: "red" },
    },
    {
      breakpointId: "base",
      styleSourceId: "0:ws:style",
      state: ":hover",
      property: "color",
      value: { type: "keyword", value: "blue" },
    },
  ]);
});

test("avoid generating style data without styles", () => {
  const { breakpoints, styleSources, styleSourceSelections, styles } =
    renderTemplate(<$.Body></$.Body>);
  expect(breakpoints).toEqual([]);
  expect(styleSources).toEqual([]);
  expect(styleSourceSelections).toEqual([]);
  expect(styles).toEqual([]);
});
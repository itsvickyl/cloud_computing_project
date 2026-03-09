import { dynamicObj } from "@/types";

export function toQueryString(obj: dynamicObj) {
  const params = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const param = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      params.push(param);
    }
  }

  const parameters = params.length > 0 ? `?${params.join("&")}` : "";
  return parameters;
}

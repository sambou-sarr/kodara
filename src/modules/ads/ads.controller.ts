import { parseBody, route } from "../../lib/handler";
import { clientContext } from "../../lib/request";
import { completeSchema, downloadSchema } from "./ads.schemas";
import { AdsService } from "./ads.service";

export const AdsController = {
  start: route(async req => AdsService.start(clientContext(req))),

  complete: route(async req =>
    AdsService.complete(await parseBody(req, completeSchema), clientContext(req))
  ),

  download: route(async req =>
    AdsService.download(await parseBody(req, downloadSchema), clientContext(req))
  ),
};

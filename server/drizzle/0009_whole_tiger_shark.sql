CREATE INDEX "results_liveClassId_idx" ON "live_results" USING btree ("liveClassId");--> statement-breakpoint
CREATE INDEX "live_split_controlls_liveClassId_idx" ON "live_split_controlls" USING btree ("liveClassId");--> statement-breakpoint
CREATE INDEX "live_split_results_liveResultId_idx" ON "live_split_results" USING btree ("liveResultId");
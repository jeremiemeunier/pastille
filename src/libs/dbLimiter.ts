import mongoose from "mongoose";
import Bottleneck from "bottleneck";

const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100,
});

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function (...args: unknown[]) {
  return limiter.schedule(() => exec.apply(this, args as any));
};

export default limiter;

export function getEnterpriseBuildCost(baseCost:number,purchaseCount:number):number {
  const count=Math.max(0,Math.floor(Number.isFinite(purchaseCount)?purchaseCount:0));
  return baseCost*Math.pow(1.1,count);
}

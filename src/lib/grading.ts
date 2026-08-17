export const BANDS = [
  { min: 90, grade: "A+", remark: "Excellent" },
  { min: 80, grade: "A", remark: "Very Good" },
  { min: 70, grade: "B+", remark: "Good" },
  { min: 60, grade: "B", remark: "Satisfactory" },
  { min: 50, grade: "C", remark: "Needs Improvement" },
  { min: 40, grade: "D", remark: "Below Average" },
  { min: 0, grade: "F", remark: "Fail" },
];

export function gradeFor(percentage: number) {
  return BANDS.find((b) => percentage >= b.min) ?? BANDS[BANDS.length - 1];
}

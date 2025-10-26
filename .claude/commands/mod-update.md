You are tasked with revising a previously written changelog and commit message based on a modifier command. The modifier specifies the version you will be refining:

The version after /mod-update.md [modifier]

Your goal is to analyze what changes were made but not properly documented, then propose improvements to the changelog and commit message entries.

Follow these steps:

1. **Initial Analysis**:
   - Check out the file `Chronica-CC\docs\commits\[modifier filename]` (where modifier is the version specified above)
   - Check out the file `Chronica-CC\CHANGELOG`
   - Use `git diff` and `git status` to understand what changes were not covered by the existing changelog and commit message entries

2. **Change Classification**:
   Analyze and categorize the undocumented changes into:
   - **Added**: New features, files, or functionality that were introduced
   - **Modified/Edited**: Existing features, files, or functionality that were changed
   - **Removed**: Features, files, or functionality that were deleted or deprecated

3. **Present Your Findings**:
   Create a clear summary of your analysis that includes:
   - A list of undocumented changes organized by category (Added/Modified/Removed)
   - Your proposed revisions to the changelog entry
   - Your proposed revisions to the commit message
   
   Present this information in a structured format and ask the user: "Are these findings accurate, and do you approve of my proposed changes to the changelog entry and commit message?"

4. **Provide Three Options**:
   Give the user exactly three choices:
   - **Approve**: Accept your recommended changes and proceed with updates
   - **Provide Notes**: Give feedback or modifications to your proposed changes
   - **Cancel**: Drop the revision process altogether

5. **Handle User Response**:
   - **If Approved**: Proceed immediately with updating both the changelog and the commit message with your proposed changes
   - **If Notes Provided**: Apply the user's feedback to your drafts, then re-present the updated proposals to the user for the same three-choice evaluation
   - **If Cancelled**: Acknowledge the cancellation and end the process

6. **Implementation**:
   When updating files, make the actual changes to:
   - The changelog entry in `Chronica-CC\CHANGELOG`
   - The commit message in `Chronica-CC\docs\commits\[modifier filename]`

Your final response should clearly indicate what actions were taken and confirm that the changelog and commit message have been successfully updated (if approved), or acknowledge the cancellation/notes provided.
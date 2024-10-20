import {PromptMap, PromptPart, /*GroupedPrompt,*/ PromptWireframe} from "@failean/shared-types";

export const STATIC = "static";
export const VARIABLE = "variable";


const ideaPrompts: PromptWireframe = {name: "idea", deps: [], level: 0}

export const convertMaptoDepGraph = (promptMap: PromptMap) => {
    let leveledPrompts: PromptWireframe[] =
        Object.keys(promptMap).map((promptName) => ({
            name: promptName,
            deps: promptMap[promptName].prompt
                .filter(
                    (promptPart: PromptPart) =>
                        promptPart.type === "variable" && promptPart.content
                )
                .map((promptPart: PromptPart) => promptPart.content || "") as string[],
            level: 0,
            result: "empty"
        }));

    leveledPrompts.unshift(ideaPrompts);

    let level = 0;

    while (leveledPrompts.some(({level}) => level < 1)) {
        level++;
        leveledPrompts
            .filter(({level}) => level === -1)
            .forEach((sp) => {
                sp.level = level - 1;
                leveledPrompts = [
                    ...leveledPrompts.filter(({name}) => name !== sp.name),
                    sp,
                ];
            });

        leveledPrompts
            .filter(({level}) => level === 0)
            .forEach((sp) => {
                const satisfied = sp.deps.every((name) => {
                    const number = leveledPrompts.find((spx) => spx.name === name)?.level;
                    return number && number > 0;
                });
                if (satisfied) {
                    sp.level = -1;
                    leveledPrompts = [
                        ...leveledPrompts.filter(({name}) => name !== sp.name),
                        sp,
                    ];
                }
            });
    }

    return leveledPrompts.map(({name, deps, level}) => ({name, deps, level}));
};

export const convertMaptoDeckGraph = () => {
    const promptGroups: Record<string, string[]> = {
        ideaSummary: [
            "refindIdea",
            "startupName",
            "visioStatment",
            "missionStatments",
            "opportunity",
            "problemStatement",
            "targetAudience",
            "solution",
        ],
        market: [
            "valueProposition",
            "competitorAnalysis",
            "marketAnalysis",
            "marketSize",
            "branding",
            "slogan",
            "channels",
            "GtmStrategy",
            "marketingCost",
            "CAC",
        ],
        product: [
            "IdealCustomerPersona",
            "uniqueValueProposition",
            "mvpUserStories",
            "mvpFeatures",
            "mvpRoadmap",
            "milestines",
            "pricing",
            "mvpDependencies",
            "mvpCost",
        ],
        business: [
            "businessModel",
            "unitEconomics",
            "partnerships",
            "operationalCosts",
            "risksAndChallenges",
        ],
        financials: [
            "salesForecastMethod",
            "salesVolumeEstimation",
            "revenueProjections",
        ],
        funding: ["fundingStrategies", "potentialInvestors"],
    };
    return promptGroups;
};

/*
export const convertMaptocritiqGraph = (promptMap: PromptMap) => {
    let critiqResults: GroupedPrompt[] = [];
    const critiqPromptGroup: Record<string, string[]> = {
        valueValidation: [
            "refindIdea",
            "valueProposition",
            "uniqueValueProposition",
            "IdealCustomerPersona",
            "pricing",
            "mvpUserStories",
            "mvpFeatures",
        ],
        marketValidation: [
            "refindIdea",
            "marketAnalysis",
            "marketSize",
            "competitorAnalysis",
            "targetAudience",
            "channels",
        ],
        businessValidation: [
            "refindIdea",
            "pricing",
            "businessModel",
            "unitEconomics",
            "partnerships",
            "operationalCosts",
            "risksAndChallenges",
        ],
        teamValidation: ["refindIdea", "teamComposition"],

        economicValidation: [
            "salesVolumeEstimation",
            "revenueProjections",
            "unitEconomics",
            "mvpCost",
            "marketingCost",
            "CAC",
        ],
        legalValidation: ["compliance", "legal", "compliancePrompt3"],
    };

    let level = 0;
    for (const groupName in critiqPromptGroup) {
        for (const promptName of critiqPromptGroup[groupName]) {
            const prompt = promptMap[promptName];
            if (prompt) {
                critiqResults.push({
                    groupName,
                    prompt,
                    level,
                });
            }
        }
        level++;
    }

    return critiqResults;
};
*/

export const validateMap = (map: PromptMap): boolean => {
    for (let key in map) {
        for (let part of map[key].prompt) {
            if (
                part.type === "variable" &&
                part.content !== "idea" &&
                !(part.content in map)
            ) {
                console.log(`Invalid content "${part.content}" in prompt "${key}"`);
                return false;
            }
        }
    }
    return true;
};

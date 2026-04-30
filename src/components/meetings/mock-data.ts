import type { Meeting } from "./types";

const QA_RAW = `# Sponic Gardens - Sonia q&A Rahul.m4a

**Rahul Sonnad** *[00:00]*: The airlines have their airline points and flights. You kind of get better values and then they radically change those. So they work completely differently now as how they work 10 years ago and such. So I, I think we'll figure something out there. And I think you want to reward targeted earlier people with incentives that may last in perpetuity, which is what happens when you get like, that's what you do with employees. You give them stock options.
**Sonia Wendorff** *[01:29]*: Yeah, but I'd say that's kind of not like a core. Like you could not do any of that and I don't think it hurts. But like, I think the business model is viable without any of that. I think doing that makes it, you know, slightly better.
**Rahul Sonnad** *[01:46]*: Yeah, Well, I think that ties into another topic, which is how much autonomy would you want to have around the things that are happening and. Or like. Yeah. In, in Spawnic Gardens.
**Rahul Sonnad** *[02:24]*: Yeah, I think that's like one of the more important questions. And my general, like, I mean, I think you got to kind of try things and see how they go. But like, I think generally you need a very kind of strict framework and guidelines. But within that you let people do what they want.
**Sonia Wendorff** *[02:50]*: Rating it. There will, you know, there will always be, I don't know, certain marketing materials that will be created.
**Rahul Sonnad** *[03:02]*: You know, we'll always, yeah. Do the data harvesting, but like the actual, like I want to run an educational thing like what that is. Anybody could decide and flash mob it, you know, so whoever's there who's interested in X could go see that.
**Rahul Sonnad** *[03:52]*: Right. Because in the pitch you mentioned toma, you know, in the very beginning, that would be one event a week and. Yeah, and I feel like investing into creating the network of people that already have their network is probably the best thing we can do to actually bring people to the location.
**Sonia Wendorff** *[04:38]*: I think that's right. But I think the crowdsource programming has to be like cohesive. Like you can't have yoga, yoga. So you have to have like yoga, food, drink, music, you know, something that makes sense, you know, in terms of its overall structure.
**Rahul Sonnad** *[40:28]*: Well, you already mentioned a monitor. So there's some, like, software and hardware responding to, like, feedback and conversations.
**Rahul Sonnad** *[40:36]*: So I think there's like a set of things, like there's devices. So you've got. You've got. Just like here you've got all the devices. And some of the devices are like monitors, like summer sensors. Summer. You know, some are input, some are output.
**Rahul Sonnad** *[41:49]*: So it's something that interviews every member and creates a profile on them and then starts, you know, vectorizes that and starts using it to match people and ask people, like, what they want to offer others and what they're looking for and what their interests are and all of that.
**Rahul Sonnad** *[47:09]*: How many mics do you have right now? I don't think we actually need them, but we should have like at least five person dinner here in the next two weeks where we just test that.
**Rahul Sonnad** *[47:33]*: That's hard to do. Like what I've read is like the voice recognition amongst a group of people is very hard versus if you have a mic for each person, it'll automatically, you know, you just say this is.
**Rahul Sonnad** *[55:20]*: So, yeah, the priorities are really, like, the CRM. Getting people seeing what connections you can make. And, like, we have to get, like, some things that, like, amaze people, where they're like. It's like, once in a while they ask Claude to do something. Wow, that's so cool.
**Rahul Sonnad** *[57:36]*: Yeah, the number one problem with startups, I think literally like the number one reason they fail is like the founders get in big fights over things and like just don't work out together.

*(scaffold demo — full transcript truncated)*`;

const GOALS_RAW = `# Rahul x Sonia - Sponic Gardens goals & vision convo

**Rahul** *[00:02]*: Like across the population, more and more people will start embracing the benefits of AI. Like, I think if you look now, it's kind of weird because from all the people I talk to, this is not the case. But like the surveys of the like US population in general are. People are very anti AI.
**Rahul** *[00:26]*: But you know, when you find people who just use like ChatGPT and they get like some really good medical info or something, you know, they kind of switch and they're like, oh, this has really helped me out.
**Sonia** *[00:39]*: Like, yeah, so they switch when they receive direct value in their life. So maybe the onboarding process for people coming in is that we focus on creating some form of value for their personal life. Like we make a website. Like you make a website with this, or you just optimize something about your life and then you're like, oh, actually this is pretty amazing.
**Rahul** *[02:20]*: I, I think the thing that I wanted to do here but just haven't really motivated on is give everybody like an open claw Hermes agent or something. Yeah, that's like talking to them every day and it's kind of like Helping them. That's their guide.
**Rahul** *[02:38]*: And so I think we should get that up and running just with the people here, just as a test.
**Sonia** *[03:10]*: Yeah. Yeah. I also think the evolution of the. The infra page should be like, these are five things that you can do right now that are going to create value for you. One of them being, like, create a website. Just upload all the information about you, clean up your computer, set up your, like, personal project management, like, really easy things.
**Rahul** *[06:04]*: Just when you join, you just get an agent, you get to name it, you get to interact with it.
**Rahul** *[06:28]*: I mean we can start with Claude or X. Now is really promoting Open Claw.
**Rahul** *[09:16]*: Yeah, so. So I think that's another thing. I'd like Hayden to just get up and running, like, because I haven't gotten my head around the agents yet.
**Sonia** *[09:35]*: He's been doing a lot of vibe coding he says he's been doing, which actually might be relevant to us doing explainer videos. Like, you take something and then it turns it into a explainer, like, animated video.

*(scaffold demo — full transcript truncated)*`;

import { parseFirefliesMarkdown, parsedTranscriptToMeeting } from "./transcript-parser";

const qaParsed = parseFirefliesMarkdown(QA_RAW);
const goalsParsed = parseFirefliesMarkdown(GOALS_RAW);

const qaMeeting: Meeting = parsedTranscriptToMeeting(qaParsed, {
  id: "meeting-qa",
  title: "Sponic Gardens — Sonia Q&A with Rahul",
  meetingDate: "2026-04-29T00:00:00.000Z",
  summary:
    "Founder Q&A covering equity, governance, demographics, physical infrastructure, and AI infrastructure. Rahul argues for crowd-sourced programming within a strict framework, a 25–45 demographic, low-cost MVP buildout (food/drink, music, A/V; saunas later), and prioritising the CRM-AI as the centerpiece. Sonia challenges around grant funding restrictions, accessibility, and the value to students. They commit to running a small live test of a recorded group dinner with mics in the next two weeks.",
  actionItems: [
    {
      id: "ai-qa-1",
      text: "Run a 5-person dinner with mics in the next two weeks to test voice recognition + AI-generated summary.",
      assigneeLabel: "Rahul Sonnad",
      sourceSegmentId: qaParsed.segments.find((s) => s.text.includes("five person dinner"))?.id ?? null,
      status: "proposed",
    },
    {
      id: "ai-qa-2",
      text: "Buy ~5 lavalier mics (~$40 each) for group recording experiments.",
      assigneeLabel: "Rahul Sonnad",
      sourceSegmentId: null,
      status: "proposed",
    },
    {
      id: "ai-qa-3",
      text: "Build first version of the CRM-AI: interview every member, vectorise profiles, surface matches.",
      assigneeLabel: "Sonia Wendorff",
      sourceSegmentId: qaParsed.segments.find((s) => s.text.includes("vectorizes"))?.id ?? null,
      status: "proposed",
    },
    {
      id: "ai-qa-4",
      text: "Have Claude scan available Polish/EU grants and shortlist non-restrictive ones.",
      assigneeLabel: null,
      sourceSegmentId: null,
      status: "proposed",
    },
  ],
});

const goalsMeeting: Meeting = parsedTranscriptToMeeting(goalsParsed, {
  id: "meeting-goals",
  title: "Rahul x Sonia — Sponic Gardens goals & vision",
  meetingDate: "2026-04-29T10:00:00.000Z",
  summary:
    "Strategic conversation on how to onboard members into AI. Rahul wants every joining member to get a personal AI agent (Open Claude / Hermes) as the main 'wow' moment. Sonia pushes for an /infra landing page reframed as 'five things you can do right now' to drive immediate personal value. They agree to start small, eat the LLM cost on the best models, and bring Hayden in to help build the agent setup.",
  actionItems: [
    {
      id: "ai-goals-1",
      text: "Stand up a personal AI agent for every member at join time (start with Open Claude / Hermes).",
      assigneeLabel: "Rahul",
      sourceSegmentId: goalsParsed.segments.find((s) => s.text.includes("just get an agent"))?.id ?? null,
      status: "proposed",
    },
    {
      id: "ai-goals-2",
      text: "Restructure the infra page into 'five things you can do right now' onboarding flow.",
      assigneeLabel: "Sonia",
      sourceSegmentId: goalsParsed.segments.find((s) => s.text.includes("five things"))?.id ?? null,
      status: "proposed",
    },
    {
      id: "ai-goals-3",
      text: "Loop Hayden in on agent setup; ask him about his vibe-coded explainer-video pipeline.",
      assigneeLabel: "Rahul",
      sourceSegmentId: goalsParsed.segments.find((s) => s.text.includes("Hayden"))?.id ?? null,
      status: "proposed",
    },
  ],
});

export const MOCK_MEETINGS: Meeting[] = [qaMeeting, goalsMeeting];

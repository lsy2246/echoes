import { Template } from "interface/template";
import { Container, Heading, Text, Box, Flex, Link } from "@radix-ui/themes";
import {
  GitHubLogoIcon,
  TwitterLogoIcon,
  LinkedInLogoIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ImageLoader } from "hooks/ParticleImage";

const socialLinks = [
  {
    icon: <GitHubLogoIcon className="w-5 h-5" />,
    url: "https://github.com/yourusername",
    label: "GitHub",
  },
  {
    icon: <TwitterLogoIcon className="w-5 h-5" />,
    url: "https://twitter.com/yourusername",
    label: "Twitter",
  },
  {
    icon: <LinkedInLogoIcon className="w-5 h-5" />,
    url: "https://linkedin.com/in/yourusername",
    label: "LinkedIn",
  },
  {
    icon: <EnvelopeClosedIcon className="w-5 h-5" />,
    url: "mailto:your.email@example.com",
    label: "Email",
  },
];

const skills = [
  { name: "React", level: 90 },
  { name: "TypeScript", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "Three.js", level: 75 },
  { name: "Python", level: 70 },
];

export default new Template({}, ({ http, args }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const ctx = gsap.context(() => {
      // 标题动画
      gsap.from(".animate-title", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
      });

      // 技能条动画
      gsap.from(".skill-bar", {
        width: 0,
        duration: 1.5,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".skills-section",
          start: "top center+=100",
        },
      });

      // 社交链接动画
      gsap.from(".social-link", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
        stagger: 0.1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <Container
      ref={containerRef}
      className={`transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <Box className="max-w-4xl mx-auto px-4">
        {/* 头部个人介绍 */}
        <Flex direction="column" align="center" className="text-center mb-16">
          <Box className="w-40 h-40 mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(10,37,77)] via-[rgb(8,27,57)] to-[rgb(2,8,23)] rounded-full overflow-hidden">
              <ImageLoader 
                src="/images/avatar-placeholder.png"
                alt="avatar"
                className="w-full h-full"
              />
            </div>
          </Box>

          <Heading size="8" className="animate-title mb-4">
            你的名字
          </Heading>
          <Text size="5" className="animate-title text-[--gray-11] mb-6">
            全栈开发者 / 设计爱好者
          </Text>
          <Text className="animate-title text-[--gray-11] max-w-2xl leading-relaxed">
            热爱编程和创新的全栈开发者，专注于创建优雅且高性能的web应用。
            擅长将复杂的问题简化，追求代码的优雅和用户体验的完美统一。
          </Text>
        </Flex>

        {/* 技能展示 */}
        <Box className="skills-section mb-16">
          <Heading size="4" className="mb-8">
            专业技能
          </Heading>
          <Flex direction="column" gap="4">
            {skills.map((skill) => (
              <Box key={skill.name}>
                <Flex justify="between" className="mb-2">
                  <Text weight="medium">{skill.name}</Text>
                  <Text className="text-[--gray-11]">{skill.level}%</Text>
                </Flex>
                <Box className="h-2 bg-[--gray-4] rounded-full overflow-hidden">
                  <Box
                    className="skill-bar h-full bg-[--accent-9] rounded-full"
                    style={{ width: `${skill.level}%` }}
                  />
                </Box>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* 社交链接 */}
        <Flex
          gap="4"
          justify="center"
          className="pt-8 border-t border-[--gray-5]"
        >
          {socialLinks.map((link, index) => (
            <Link
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link p-3 rounded-full hover:bg-[--gray-3] transition-colors"
            >
              {link.icon}
            </Link>
          ))}
        </Flex>
      </Box>
    </Container>
  );
});

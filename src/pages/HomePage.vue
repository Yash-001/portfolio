<template>
  <div>
    <HeroSection />
    <AboutSection />
    <SkillsSection />
    <ExperienceSection />
    <ProjectsSection />
  </div>
</template>

<script setup lang="ts">
import HeroSection       from '@/components/sections/home/HeroSection.vue'
import AboutSection      from '@/components/sections/about/AboutSection.vue'
import SkillsSection     from '@/components/sections/skills/SkillsSection.vue'
import ExperienceSection from '@/components/sections/experience/ExperienceSection.vue'
import ProjectsSection   from '@/components/sections/projects/ProjectsSection.vue'
</script>

// Test script to verify lesson creation and database connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLessonCreation() {
  try {
    console.log('Testing lesson creation...')
    
    // Test 1: Check if we can read modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .limit(1)
    
    if (modulesError) {
      console.error('Error reading modules:', modulesError)
      return
    }
    
    console.log('✅ Modules can be read:', modules.length)
    
    // Test 2: Check if we can read lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .limit(1)
    
    if (lessonsError) {
      console.error('Error reading lessons:', lessonsError)
      return
    }
    
    console.log('✅ Lessons can be read:', lessons.length)
    
    // Test 3: Check lessons for a specific module
    if (modules.length > 0) {
      const moduleId = modules[0].id
      const { data: moduleLessons, error: moduleLessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true })
      
      if (moduleLessonsError) {
        console.error('Error reading module lessons:', moduleLessonsError)
      } else {
        console.log(`✅ Module ${moduleId} has ${moduleLessons.length} lessons`)
        console.log('Lessons:', moduleLessons)
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testLessonCreation()

